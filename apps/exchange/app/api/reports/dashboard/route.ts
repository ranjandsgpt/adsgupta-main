export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";

export async function GET() {
  const [auctions, impressions, clicks, revenue, recent] = await Promise.all([
    sql<{ count: string }>`SELECT COUNT(*)::text AS count FROM auction_log`,
    sql<{ count: string }>`SELECT COUNT(*)::text AS count FROM impressions`,
    sql<{ count: string }>`SELECT COUNT(*)::text AS count FROM clicks`,
    sql<{ revenue: string }>`SELECT COALESCE(SUM(winning_bid), 0)::text AS revenue FROM auction_log`,
    sql`SELECT auction_id, winning_bid, bid_count, created_at FROM auction_log ORDER BY created_at DESC LIMIT 20`
  ]);
  return json({
    totalAuctions: Number(auctions.rows[0]?.count ?? 0),
    totalImpressions: Number(impressions.rows[0]?.count ?? 0),
    totalClicks: Number(clicks.rows[0]?.count ?? 0),
    totalRevenue: Number(revenue.rows[0]?.revenue ?? 0),
    ctr:
      Number(impressions.rows[0]?.count ?? 0) > 0
        ? (Number(clicks.rows[0]?.count ?? 0) / Number(impressions.rows[0]?.count ?? 0)) * 100
        : 0,
    recentAuctions: recent.rows
  });
}
