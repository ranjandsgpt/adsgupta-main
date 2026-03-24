export const dynamic = "force-dynamic";
import { OpenRTBBidRequest, OpenRTBBidResponse, runAuction } from "@/lib/auction-engine";
import { NextRequest, NextResponse } from "next/server";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

export async function POST(request: NextRequest) {
  const bidRequest = (await request.json()) as OpenRTBBidRequest;
  const result = await runAuction(bidRequest);

  const response: OpenRTBBidResponse = {
    id: bidRequest.id,
    seatbid: result.winner
      ? [
          {
            bid: [
              {
                id: `${bidRequest.id}-1`,
                impid: bidRequest.imp[0]?.id ?? "1",
                price: result.clearingPrice,
                adid: result.winner.campaignId,
                crid: result.winner.creativeId,
                adm: result.creative?.html_snippet
                  ? result.creative.html_snippet
                  : `<a href="${result.creative?.click_url ?? "#"}" target="_blank" rel="noopener noreferrer"><img src="${result.creative?.image_url ?? ""}" alt="ad" style="max-width:100%;height:auto;" /></a>`,
                nurl: `${request.nextUrl.origin}/api/openrtb/win?auctionId=${encodeURIComponent(bidRequest.id)}`
              }
            ]
          }
        ]
      : [],
    cur: "USD"
  };

  return NextResponse.json(response, {
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  });
}
