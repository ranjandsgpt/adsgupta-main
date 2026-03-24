export const dynamic = "force-dynamic";
import { OpenRTBBidRequest, runAuction } from "@/lib/auction-engine";
import { NextRequest, NextResponse } from "next/server";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors });
}

export async function POST(request: NextRequest) {
  let bidRequest: OpenRTBBidRequest;
  try {
    bidRequest = (await request.json()) as OpenRTBBidRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: cors });
  }

  const imp = bidRequest.imp?.[0];
  const adUnitId = imp?.tagid;
  if (!bidRequest.id || !adUnitId) {
    return NextResponse.json({ id: bidRequest.id ?? "", nbr: 2 }, { headers: cors });
  }

  const pageUrl = bidRequest.site?.page ?? null;
  const bidfloor = Math.max(0, Number(imp?.bidfloor ?? 0));

  const result = await runAuction(bidRequest.id, adUnitId, imp, pageUrl, bidfloor);

  if (!result?.winner) {
    return NextResponse.json({ id: bidRequest.id, nbr: 2 }, { headers: cors });
  }

  const base = request.nextUrl.origin;
  const w = result.winner;
  const bidId = result.auctionLogId;
  const nurl = `${base}/api/openrtb/win?auctionId=${encodeURIComponent(bidRequest.id)}&price=\${AUCTION_PRICE}`;

  return NextResponse.json(
    {
      id: bidRequest.id,
      seatbid: [
        {
          bid: [
            {
              id: bidId,
              impid: imp?.id ?? "1",
              price: w.clearingPrice,
              adm: w.adm,
              adid: w.campaignId,
              crid: w.creativeId,
              nurl,
              w: w.w,
              h: w.h
            }
          ]
        }
      ],
      cur: "USD"
    },
    { headers: cors }
  );
}
