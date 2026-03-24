export const dynamic = "force-dynamic";
import { OpenRTBBidRequest, runAuction } from "@/lib/auction-engine";
import { NextRequest, NextResponse } from "next/server";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

const AUCTION_TIMEOUT_MS = 2000;
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

  let bidRequest: OpenRTBBidRequest;
  try {
    bidRequest = (await request.json()) as OpenRTBBidRequest;
  } catch {
    const ms = Date.now() - started;
    return NextResponse.json({ nbr: 1 }, { status: 200, headers: responseHeaders(ms) });
  }

  const imp = bidRequest.imp?.[0];
  const adUnitId = imp?.tagid?.trim() || imp?.id?.trim() || "";
  const pageUrl = bidRequest.site?.page ?? null;

  console.log("[openrtb]", bidRequest.id, "unit:", adUnitId || "(missing)", "page:", bidRequest.site?.page);

  if (!bidRequest.id || !adUnitId) {
    const ms = Date.now() - started;
    return NextResponse.json({ id: bidRequest.id ?? "", nbr: 2 }, { status: 200, headers: responseHeaders(ms) });
  }

  const bidfloor = Math.max(0, Number(imp?.bidfloor ?? 0));

  const runPromise = runAuction(bidRequest.id, adUnitId, imp, pageUrl, bidfloor, {
    site: bidRequest.site,
    device: bidRequest.device
  })
    .then((r) => ({ kind: "done" as const, r }))
    .catch((e) => {
      console.error("[openrtb] runAuction failed:", e);
      return { kind: "done" as const, r: null as Awaited<ReturnType<typeof runAuction>> };
    });

  const raced = await Promise.race([
    runPromise,
    new Promise<{ kind: "timeout" }>((resolve) => setTimeout(() => resolve({ kind: "timeout" }), AUCTION_TIMEOUT_MS))
  ]);

  const ms = Date.now() - started;

  if (raced.kind === "timeout") {
    return NextResponse.json(
      { id: bidRequest.id, nbr: 104 },
      { status: 200, headers: responseHeaders(ms) }
    );
  }

  const result = raced.r;
  const auctionHeader = result?.auctionLogId ?? null;

  if (!result?.winner) {
    return NextResponse.json(
      { id: bidRequest.id, nbr: 2 },
      { status: 200, headers: responseHeaders(ms, auctionHeader) }
    );
  }

  const w = result.winner;
  const auctionId = w.auctionId;
  const nurl = `${WIN_BASE}?auctionId=${encodeURIComponent(auctionId)}&price=\${AUCTION_PRICE}`;

  return NextResponse.json(
    {
      id: bidRequest.id,
      seatbid: [
        {
          bid: [
            {
              id: auctionId,
              impid: imp?.id ?? "1",
              price: w.clearingPrice,
              adm: w.adm,
              nurl,
              adid: w.winnerId,
              cid: w.winnerId,
              crid: w.creativeId,
              w: w.w,
              h: w.h
            }
          ],
          seat: "mde"
        }
      ],
      bidid: auctionId,
      cur: "USD"
    },
    { status: 200, headers: responseHeaders(ms, auctionId) }
  );
}
