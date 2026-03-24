export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

export type DemandPerformanceRow = {
  campaign_id: string;
  campaign_name: string;
  advertiser_name: string;
  wins: number;
  sum_bid_count: number;
  avg_bid_count: number;
  revenue: number;
  impressions_today: number;
  total_auctions_today: number;
  win_rate_pct: number;
  bid_share_pct: number;
};

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role !== "admin") return forbidden();

  try {
    const totalAuc = await sql<{ c: number }>`
      SELECT COUNT(*)::int AS c FROM auction_log WHERE created_at::date = CURRENT_DATE
    `;
    const totalAuctionsToday = Number(totalAuc.rows[0]?.c ?? 0);

    const agg = await sql<{
      id: string;
      campaign_name: string | null;
      name: string | null;
      advertiser_name: string | null;
      advertiser: string | null;
      wins: string;
      sum_bid_count: string;
      avg_bid_count: string;
      revenue: string;
      impressions_today: string;
    }>`
      SELECT
        c.id,
        c.campaign_name,
        c.name,
        c.advertiser_name,
        c.advertiser,
        COUNT(al.id)::text AS wins,
        COALESCE(SUM(al.bid_count), 0)::text AS sum_bid_count,
        COALESCE(AVG(al.bid_count), 0)::text AS avg_bid_count,
        (COALESCE(SUM(al.winning_bid), 0) / 1000)::text AS revenue,
        (
          SELECT COUNT(*)::text FROM impressions i
          WHERE i.campaign_id = c.id AND i.created_at::date = CURRENT_DATE
        ) AS impressions_today
      FROM auction_log al
      INNER JOIN campaigns c ON c.id = al.winning_campaign_id
      WHERE al.cleared = true AND al.created_at::date = CURRENT_DATE
      GROUP BY c.id, c.campaign_name, c.name, c.advertiser_name, c.advertiser
      ORDER BY COUNT(al.id) DESC
      LIMIT 100
    `;

    const sumBidsAll = agg.rows.reduce((s, r) => s + Number(r.sum_bid_count ?? 0), 0);

    const rows: DemandPerformanceRow[] = agg.rows.map((r) => {
      const wins = Number(r.wins ?? 0);
      const sumBid = Number(r.sum_bid_count ?? 0);
      const winRate = totalAuctionsToday > 0 ? (wins / totalAuctionsToday) * 100 : 0;
      const bidShare = sumBidsAll > 0 ? (sumBid / sumBidsAll) * 100 : 0;
      return {
        campaign_id: r.id,
        campaign_name: String(r.campaign_name ?? r.name ?? "Campaign"),
        advertiser_name: String(r.advertiser_name ?? r.advertiser ?? "—"),
        wins,
        sum_bid_count: sumBid,
        avg_bid_count: Number(r.avg_bid_count ?? 0),
        revenue: Number(r.revenue ?? 0),
        impressions_today: Number(r.impressions_today ?? 0),
        total_auctions_today: totalAuctionsToday,
        win_rate_pct: winRate,
        bid_share_pct: bidShare
      };
    });

    return json({ rows, total_auctions_today: totalAuctionsToday });
  } catch (e) {
    console.error("[demand-performance]", e);
    return json({ error: "Failed to load demand performance" }, 500);
  }
}
