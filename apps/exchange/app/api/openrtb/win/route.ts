export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const auctionId = request.nextUrl.searchParams.get("auctionId");
  if (!auctionId) return json({ ok: false, error: "auctionId is required" }, 400);

  const log = await sql<{
    ad_unit_id: string;
    winning_campaign_id: string | null;
    winning_creative_id: string | null;
    winning_bid: string | null;
    page_url: string | null;
  }>`SELECT ad_unit_id, winning_campaign_id, winning_creative_id, winning_bid, page_url FROM auction_log WHERE auction_id = ${auctionId} ORDER BY created_at DESC LIMIT 1`;
  const row = log.rows[0];
  if (!row) return json({ ok: false, error: "Auction not found" }, 404);

  await sql`UPDATE auction_log SET cleared = true WHERE auction_id = ${auctionId}`;
  await sql`
    INSERT INTO impressions (auction_id, ad_unit_id, campaign_id, creative_id, winning_bid, page_url)
    VALUES (${auctionId}, ${row.ad_unit_id}, ${row.winning_campaign_id}, ${row.winning_creative_id}, ${row.winning_bid}, ${row.page_url})
  `;
  return json({ ok: true });
}
