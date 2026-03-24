import { computeExchangeStats } from "@/lib/stats-queries";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest, NextResponse } from "next/server";

export const revalidate = 60;

/** Extended exchange dashboard: full stats shape plus legacy admin counters. */
export type ExchangeReportsDashboard = Awaited<ReturnType<typeof computeExchangeStats>> & {
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
    const [stats, activeCampaigns, activePublishers, pendingPublishers, pendingCampaigns] = await Promise.all([
      computeExchangeStats(null),
      sql<{ c: number }>`SELECT COUNT(*)::int AS c FROM campaigns WHERE status = 'active'`,
      sql<{ c: number }>`SELECT COUNT(*)::int AS c FROM publishers WHERE status = 'active'`,
      sql<{ c: number }>`SELECT COUNT(*)::int AS c FROM publishers WHERE status = 'pending'`,
      sql<{ c: number }>`SELECT COUNT(*)::int AS c FROM campaigns WHERE status = 'pending'`
    ]);

    const payload: ExchangeReportsDashboard = {
      ...stats,
      activeCampaigns: Number(activeCampaigns.rows[0]?.c ?? 0),
      activePublishers: Number(activePublishers.rows[0]?.c ?? 0),
      pendingPublishers: Number(pendingPublishers.rows[0]?.c ?? 0),
      pendingCampaigns: Number(pendingCampaigns.rows[0]?.c ?? 0)
    };

    return NextResponse.json({
      ...payload,
      totalImpressions: payload.impressionsTotal,
      totalClicks: payload.clicksTotal,
      totalRevenue: payload.revenueTotal
    });
  } catch (e) {
    console.error("[reports/dashboard]", e);
    return json({ error: "Failed to load reports" }, 500);
  }
}
