import { sql } from "@/lib/db";

export type AuctionStreamRow = Record<string, unknown>;

export async function getAuctionStreamCursor(publisherId?: string | null): Promise<{ t: string; id: string } | null> {
  const pub = publisherId?.trim() || null;
  const r = await sql<{ created_at: string; id: string }>`
    SELECT created_at::text, id::text
    FROM auction_log
    WHERE (${pub}::text IS NULL OR publisher_id = ${pub}::uuid)
    ORDER BY created_at DESC, id DESC
    LIMIT 1
  `;
  const row = r.rows[0];
  return row ? { t: row.created_at, id: row.id } : null;
}

export async function getAuctionRowsAfter(
  cursor: { t: string; id: string },
  publisherId?: string | null
): Promise<{ rows: AuctionStreamRow[]; next: { t: string; id: string } }> {
  const pub = publisherId?.trim() || null;
  const result = await sql<
    Record<string, unknown> & {
      id: string;
      created_at: string;
    }
  >`
    SELECT
      al.id,
      al.auction_id,
      al.ad_unit_id,
      al.publisher_id,
      al.winning_campaign_id,
      al.winning_creative_id,
      al.winning_bid,
      al.floor_price,
      al.bid_count,
      al.cleared,
      al.page_url,
      al.user_agent,
      al.demand_source,
      al.created_at::text AS created_at,
      p.domain AS publisher_domain,
      u.name AS ad_unit_name,
      cr.image_url AS creative_image_url
    FROM auction_log al
    LEFT JOIN publishers p ON p.id = al.publisher_id
    LEFT JOIN ad_units u ON u.id = al.ad_unit_id
    LEFT JOIN creatives cr ON cr.id = al.winning_creative_id
    WHERE (al.created_at, al.id) > (${cursor.t}::timestamptz, ${cursor.id}::uuid)
    AND (${pub}::text IS NULL OR al.publisher_id = ${pub}::uuid)
    ORDER BY al.created_at ASC, al.id ASC
    LIMIT 100
  `;
  const rows = result.rows as AuctionStreamRow[];
  let next = cursor;
  if (rows.length > 0) {
    const last = rows[rows.length - 1];
    next = { t: String(last.created_at), id: String(last.id) };
  }
  return { rows, next };
}
