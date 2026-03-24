export const dynamic = "force-dynamic";
import { recordAuctionLatencyMs } from "@/lib/auction-latency";
import { runAuction, type OpenRTBBidRequest } from "@/lib/auction-engine";
import { detectIVT } from "@/lib/ivt-detector";
import type { OpenRTB26Bid } from "@/lib/openrtb-types";
import { rateLimitResponse } from "@/lib/rate-limit-http";
import { getClientIp } from "@/lib/rate-limiter";
import { NextRequest, NextResponse } from "next/server";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-MDE-Version"
};

const DEFAULT_TMAX = 500;
const MAX_TMAX = 5000;

const WIN_BASE = "https://exchange.adsgupta.com/api/openrtb/win";

function responseHeaders(ms: number, auctionId?: string | null): HeadersInit {
  const h: Record<string, string> = {
    ...cors,
    "X-Response-Time": String(ms)
  };
  if (auctionId) h["X-Auction-Id"] = auctionId;
  return h;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: cors });
}

export async function POST(request: NextRequest) {
  const started = Date.now();
  const finish = (res: NextResponse) => {
    recordAuctionLatencyMs(Date.now() - started);
    return res;
  };

  const limited = rateLimitResponse(request, "openrtb:auction", 500, 60_000);
  if (limited) return finish(limited);

  let bidRequest: OpenRTBBidRequest;
  try {
    bidRequest = (await request.json()) as OpenRTBBidRequest;
  } catch {
    const ms = Date.now() - started;
    return finish(NextResponse.json({ nbr: 1 }, { status: 200, headers: responseHeaders(ms) }));
  }

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

  const bidfloor = Math.max(0, Number(imp?.bidfloor ?? 0));

  const runPromise = runAuction(bidRequest.id, adUnitId, imp, pageUrl, bidfloor, {
    site: bidRequest.site,
    app: bidRequest.app,
    device: bidRequest.device,
    user: bidRequest.user,
    fullRequest: bidRequest,
    ipForLog,
    markIvt
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
