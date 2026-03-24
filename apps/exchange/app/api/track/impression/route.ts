export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const GIF_1X1 = Buffer.from(
  "R0lGODlhAQABAIABAP///wAAACwAAAAAAQABAAACAkQBADs=",
  "base64"
);

export async function GET(request: NextRequest) {
  const auctionId = request.nextUrl.searchParams.get("auctionId");
  if (auctionId) {
    const log = await sql<{
      ad_unit_id: string;
      winning_campaign_id: string | null;
      winning_creative_id: string | null;
      winning_bid: string | null;
      page_url: string | null;
    }>`SELECT ad_unit_id, winning_campaign_id, winning_creative_id, winning_bid, page_url FROM auction_log WHERE auction_id = ${auctionId} ORDER BY created_at DESC LIMIT 1`;
    const row = log.rows[0];
    if (row) {
      await sql`
        INSERT INTO impressions (auction_id, ad_unit_id, campaign_id, creative_id, winning_bid, page_url)
        VALUES (${auctionId}, ${row.ad_unit_id}, ${row.winning_campaign_id}, ${row.winning_creative_id}, ${row.winning_bid}, ${row.page_url})
      `;
    }
  }

  return new NextResponse(GIF_1X1, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store"
    }
  });
}
