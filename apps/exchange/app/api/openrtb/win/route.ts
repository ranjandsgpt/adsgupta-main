export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const auctionId = request.nextUrl.searchParams.get("auctionId");
  const priceRaw = request.nextUrl.searchParams.get("price");
  if (!auctionId) return json({ ok: false, error: "auctionId is required" }, 400);

  let price = priceRaw != null && priceRaw !== "" ? Number(priceRaw) : null;
  if (price != null && Number.isNaN(price)) price = null;

  try {
    const log = await sql<{
      id: string;
      ad_unit_id: string | null;
      winning_campaign_id: string | null;
      winning_creative_id: string | null;
      winning_bid: string | null;
      page_url: string | null;
    }>`
      SELECT id, ad_unit_id, winning_campaign_id, winning_creative_id, winning_bid::text, page_url
      FROM auction_log
      WHERE auction_id = ${auctionId}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const row = log.rows[0];
    if (!row) return json({ ok: false, error: "Auction not found" }, 404);

    const clearPrice = price != null && !Number.isNaN(price) ? price : (row.winning_bid ? Number(row.winning_bid) : null);

    await sql`
      UPDATE auction_log
      SET cleared = true,
          winning_bid = COALESCE(${clearPrice}, winning_bid)
      WHERE id = ${row.id}
    `;

    if (row.ad_unit_id && row.winning_campaign_id && row.winning_creative_id) {
      const exists = await sql<{ c: string }>`
        SELECT COUNT(*)::text AS c FROM impressions WHERE auction_id = ${auctionId}
      `;
      if (Number(exists.rows[0]?.c ?? 0) === 0) {
        await sql`
          INSERT INTO impressions (auction_id, ad_unit_id, campaign_id, creative_id, winning_bid, page_url)
          VALUES (${auctionId}, ${row.ad_unit_id}, ${row.winning_campaign_id}, ${row.winning_creative_id}, ${clearPrice}, ${row.page_url})
        `;
      }
    }

    return json({ ok: true });
  } catch (e) {
    console.error("[win]", e);
    return json({ ok: false, error: "Server error" }, 500);
  }
}
