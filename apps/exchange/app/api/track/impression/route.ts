export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

/** 1x1 transparent GIF (exact spec). */
const GIF_1X1 = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

const headers = {
  "Content-Type": "image/gif",
  "Cache-Control": "no-cache, no-store",
  Pragma: "no-cache"
};

/** `id` = `auction_log.id` (UUID). Inserts impression once per log row. */
export async function GET(request: NextRequest) {
  const logId = request.nextUrl.searchParams.get("id");

  try {
    if (logId) {
      const log = await sql<{
        id: string;
        auction_id: string;
        ad_unit_id: string | null;
        winning_campaign_id: string | null;
        winning_creative_id: string | null;
        winning_bid: string | null;
        page_url: string | null;
      }>`
        SELECT id, auction_id, ad_unit_id, winning_campaign_id, winning_creative_id, winning_bid::text, page_url
        FROM auction_log
        WHERE id = ${logId}
        LIMIT 1
      `;
      const row = log.rows[0];
      if (row?.ad_unit_id && row.winning_campaign_id && row.winning_creative_id) {
        const exists = await sql<{ c: string }>`
          SELECT COUNT(*)::text AS c FROM impressions WHERE auction_log_id = ${row.id}
        `;
        if (Number(exists.rows[0]?.c ?? 0) === 0) {
          const wb = row.winning_bid != null ? Number(row.winning_bid) : null;
          await sql`
            INSERT INTO impressions (auction_log_id, auction_id, ad_unit_id, campaign_id, creative_id, winning_bid, page_url)
            SELECT ${row.id}, ${row.auction_id}, ${row.ad_unit_id}, ${row.winning_campaign_id}, ${row.winning_creative_id}, ${wb}, ${row.page_url}
            WHERE NOT EXISTS (SELECT 1 FROM impressions WHERE auction_log_id = ${row.id})
          `;
        }
      }
    }
  } catch (e) {
    console.error("[impression]", e);
  }

  return new NextResponse(GIF_1X1, { headers });
}
