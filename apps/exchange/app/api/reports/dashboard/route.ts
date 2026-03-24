export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { getAuthFromRequest, unauthorized, forbidden } from "@/lib/require-auth";
import { NextRequest } from "next/server";

export type ExchangeReportsDashboard = {
  totalAuctions: number;
  totalImpressions: number;
  totalClicks: number;
  fillRate: number;
  avgCpm: number;
  totalRevenue: number;
  activeCampaigns: number;
  activePublishers: number;
  pendingPublishers: number;
  pendingCampaigns: number;
};

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role !== "admin") return forbidden();

  try {
    const [
      totalAuctions,
      clearedAuctions,
      totalImpressions,
      totalClicks,
      avgCpm,
      totalRevenue,
      activeCampaigns,
      activePublishers,
      pendingPublishers,
      pendingCampaigns
    ] = await Promise.all([
      sql<{ c: number }>`SELECT COUNT(*)::int AS c FROM auction_log`,
      sql<{ c: number }>`SELECT COUNT(*)::int AS c FROM auction_log WHERE cleared = true AND winning_campaign_id IS NOT NULL`,
      sql<{ c: number }>`SELECT COUNT(*)::int AS c FROM impressions`,
      sql<{ c: number }>`SELECT COUNT(*)::int AS c FROM clicks`,
      sql<{ a: string }>`SELECT COALESCE(AVG(winning_bid), 0)::text AS a FROM auction_log WHERE winning_bid IS NOT NULL`,
      sql<{ s: string }>`SELECT COALESCE(SUM(winning_bid), 0)::text AS s FROM impressions WHERE winning_bid IS NOT NULL`,
      sql<{ c: number }>`SELECT COUNT(*)::int AS c FROM campaigns WHERE status = 'active'`,
      sql<{ c: number }>`SELECT COUNT(*)::int AS c FROM publishers WHERE status = 'active'`,
      sql<{ c: number }>`SELECT COUNT(*)::int AS c FROM publishers WHERE status = 'pending'`,
      sql<{ c: number }>`SELECT COUNT(*)::int AS c FROM campaigns WHERE status = 'pending'`
    ]);

    const ta = Number(totalAuctions.rows[0]?.c ?? 0);
    const cleared = Number(clearedAuctions.rows[0]?.c ?? 0);
    const timp = Number(totalImpressions.rows[0]?.c ?? 0);
    const tclk = Number(totalClicks.rows[0]?.c ?? 0);

    const payload: ExchangeReportsDashboard = {
      totalAuctions: ta,
      totalImpressions: timp,
      totalClicks: tclk,
      fillRate: ta > 0 ? (cleared / ta) * 100 : 0,
      avgCpm: Number(avgCpm.rows[0]?.a ?? 0),
      totalRevenue: Number(totalRevenue.rows[0]?.s ?? 0),
      activeCampaigns: Number(activeCampaigns.rows[0]?.c ?? 0),
      activePublishers: Number(activePublishers.rows[0]?.c ?? 0),
      pendingPublishers: Number(pendingPublishers.rows[0]?.c ?? 0),
      pendingCampaigns: Number(pendingCampaigns.rows[0]?.c ?? 0)
    };

    return json(payload);
  } catch (e) {
    console.error("[reports/dashboard]", e);
    return json({ error: "Failed to load reports" }, 500);
  }
}
