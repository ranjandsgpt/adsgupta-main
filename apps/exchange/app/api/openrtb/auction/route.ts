export const dynamic = "force-dynamic";
import { recordAuctionLatencyMs } from "@/lib/auction-latency";
import { runAuction, type OpenRTBBidRequest } from "@/lib/auction-engine";
import { sql } from "@/lib/db";
import { detectIVT } from "@/lib/ivt-detector";
import type { OpenRTB26Bid } from "@/lib/openrtb-types";
import { rateLimitResponse } from "@/lib/rate-limit-http";
import { getClientIp } from "@/lib/rate-limiter";
import { buildAuctionSignalSnapshot, enrichBidRequest } from "@/lib/signal-enricher";
import { processSignalEvent, signalEventFromAuction } from "@/lib/signal-processor";
import { NextRequest, NextResponse } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-MDE-Version",
  "Access-Control-Max-Age": "86400"
};

const DEFAULT_TMAX = 3000;
const MAX_TMAX = 5000;

const WIN_BASE = "https://exchange.adsgupta.com/api/openrtb/win";

function responseHeaders(ms: number, auctionId?: string | null): HeadersInit {
  const h: Record<string, string> = {
    ...CORS_HEADERS,
    "X-Response-Time": String(ms)
  };
  if (auctionId) h["X-Auction-Id"] = auctionId;
  return h;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  const started = Date.now();
  const finish = (res: NextResponse) => {
    recordAuctionLatencyMs(Date.now() - started);
    return res;
  };

  const limited = rateLimitResponse(request, "openrtb:auction", 500, 60_000);
  if (limited) {
    // Ensure rate-limited responses also satisfy cross-origin tags.
    for (const [k, v] of Object.entries(CORS_HEADERS)) limited.headers.set(k, v);
    return finish(limited);
  }

  let bidRequest: OpenRTBBidRequest;
  try {
    bidRequest = (await request.json()) as OpenRTBBidRequest;
  } catch {
    const ms = Date.now() - started;
    return finish(NextResponse.json({ nbr: 1 }, { status: 200, headers: responseHeaders(ms) }));
  }

  // OpenRTB `at`: 1=first-price (default), 2=second-price (legacy compatibility).
  bidRequest.at = bidRequest.at === 2 ? 2 : 1;

  const imp = bidRequest.imp?.[0];
  const adUnitId = imp?.tagid?.trim() || imp?.id?.trim() || "";
  const pageUrl = bidRequest.site?.page ?? bidRequest.app?.storeurl ?? null;

  const tmaxRaw = bidRequest.tmax != null ? Number(bidRequest.tmax) : DEFAULT_TMAX;
  const auctionTimeoutMs = Math.min(
    MAX_TMAX,
    Math.max(50, Number.isFinite(tmaxRaw) ? tmaxRaw : DEFAULT_TMAX)
  );

  const forwardFor = request.headers.get("x-forwarded-for");
  const ipForLog = forwardFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || bidRequest.device?.ip || null;

  console.log(
    "[openrtb]",
    bidRequest.id,
    "unit:",
    adUnitId || "(missing)",
    "page:",
    bidRequest.site?.page,
    "at:",
    bidRequest.at,
    "tmax:",
    auctionTimeoutMs
  );

  if (!bidRequest.id || !adUnitId) {
    const ms = Date.now() - started;
    return finish(NextResponse.json({ id: bidRequest.id ?? "", nbr: 2 }, { status: 200, headers: responseHeaders(ms) }));
  }

  const uaForIvt = bidRequest.device?.ua ? String(bidRequest.device.ua) : "";
  const referer = request.headers.get("referer") ?? "";
  const ivt = detectIVT(uaForIvt, getClientIp(request), referer);
  if (ivt.givtScore >= 100) {
    const ms = Date.now() - started;
    return finish(NextResponse.json({ id: bidRequest.id, nbr: 2 }, { status: 200, headers: responseHeaders(ms) }));
  }
  const markIvt = ivt.givtScore >= 80;

  if (bidRequest.regs?.gdpr === 1) {
    const cs = bidRequest.user?.consent;
    if (typeof cs !== "string" || !cs.trim()) {
      const ms = Date.now() - started;
      return finish(NextResponse.json({ id: bidRequest.id, nbr: 2 }, { status: 200, headers: responseHeaders(ms) }));
    }
  }

  const bidfloor = Math.max(0, Number(imp?.bidfloor ?? 0));

  let enriched = bidRequest;
  let signalSnapshot: Record<string, unknown> = {};
  try {
    enriched = await enrichBidRequest(bidRequest, request);
    signalSnapshot = buildAuctionSignalSnapshot(bidRequest, enriched);
  } catch (e) {
    console.error("[openrtb/auction] enrichBidRequest", e instanceof Error ? e.message : e);
    enriched = bidRequest;
    try {
      signalSnapshot = buildAuctionSignalSnapshot(bidRequest, bidRequest);
    } catch {
      signalSnapshot = {};
    }
  }

  const impForAuction = enriched.imp?.[0] ?? imp;
  const pageForAuction = enriched.site?.page ?? enriched.app?.storeurl ?? pageUrl;

  const runPromise = runAuction(enriched.id, adUnitId, impForAuction, pageForAuction, bidfloor, {
    site: enriched.site,
    app: enriched.app,
    device: enriched.device,
    user: enriched.user,
    fullRequest: enriched,
    ipForLog,
    markIvt,
    rawSignals: signalSnapshot
  })
    .then((r) => ({ kind: "done" as const, r }))
    .catch((e) => {
      console.error("[openrtb] runAuction failed:", e);
      return { kind: "done" as const, r: null as Awaited<ReturnType<typeof runAuction>> };
    });

  const raced = await Promise.race([
    runPromise,
    new Promise<{ kind: "timeout" }>((resolve) => setTimeout(() => resolve({ kind: "timeout" }), auctionTimeoutMs))
  ]);

  const ms = Date.now() - started;

  if (raced.kind === "timeout") {
    return finish(
      NextResponse.json({ id: bidRequest.id, nbr: 104 }, { status: 200, headers: responseHeaders(ms) })
    );
  }

  const result = raced.r;
  const auctionHeader = result?.auctionLogId ?? null;

  if (result?.auctionLogId) {
    const procMs = Date.now() - started;
    void sql`
      UPDATE auction_log SET processing_ms = ${Math.round(procMs * 100) / 100}
      WHERE id = ${result.auctionLogId}::uuid
    `.catch(() => {});
  }

  if (result?.auctionLogId) {
    void (async () => {
      try {
        const pub = await sql<{ publisher_id: string }>`
          SELECT publisher_id::text AS publisher_id FROM ad_units WHERE id = ${adUnitId}::uuid LIMIT 1
        `;
        const pid = pub.rows[0]?.publisher_id;
        if (!pid) return;
        await processSignalEvent(
          signalEventFromAuction({
            snapshot: signalSnapshot,
            auctionId: bidRequest.id,
            publisherId: pid,
            adUnitId
          })
        );
      } catch (e) {
        console.error("[api/openrtb/auction]", e instanceof Error ? e.message : e);
      }
    })();
  }

  if (!result?.winner) {
    return finish(
      NextResponse.json({ id: bidRequest.id, nbr: 2 }, { status: 200, headers: responseHeaders(ms, auctionHeader) })
    );
  }

  const w = result.winner;
  const auctionId = w.auctionId;
  const nurl = `${WIN_BASE}?auctionId=${encodeURIComponent(auctionId)}&price=\${AUCTION_PRICE}`;

  const bidOut: OpenRTB26Bid = {
    id: auctionId,
    impid: imp?.id ?? "1",
    price: w.clearingPrice,
    adm: w.adm,
    nurl,
    adid: w.creativeId,
    cid: w.cid,
    crid: w.crid,
    adomain: w.adomain,
    iurl: w.iurl,
    w: w.w,
    h: w.h,
    cat: w.cat,
    cattax: w.cattax,
    api: w.api
  };

  return finish(
    NextResponse.json(
      {
        id: bidRequest.id,
        seatbid: [
          {
            bid: [bidOut],
            seat: "mde"
          }
        ],
        bidid: auctionId,
        cur: "USD"
      },
      { status: 200, headers: responseHeaders(ms, auctionId) }
    )
  );
}
