import { computeAdminDashboardMetrics } from "@/lib/admin-dashboard-metrics";
import { computeExchangeStats } from "@/lib/stats-queries";
import { json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest, NextResponse } from "next/server";

export const revalidate = 60;

/** Extended exchange dashboard: full stats shape plus legacy admin counters + KPI deltas. */
export type ExchangeReportsDashboard = Awaited<ReturnType<typeof computeExchangeStats>> &
  Awaited<ReturnType<typeof computeAdminDashboardMetrics>>;

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role !== "admin") return forbidden();

  try {
    const [stats, kpi] = await Promise.all([computeExchangeStats(null), computeAdminDashboardMetrics()]);

    /** Exchange-wide KPIs from `computeExchangeStats(null)` win on key collisions; admin deltas remain for the console. */
    const payload: ExchangeReportsDashboard = {
      ...kpi,
      ...stats
    };

    return NextResponse.json({
      ...payload,
      totalImpressions: stats.impressionsTotal,
      totalClicks: stats.clicksTotal,
      totalRevenue: stats.revenueTotal
    });
  } catch (e) {
    console.error("[reports/dashboard]", e);
    return json({ error: "Failed to load reports" }, 500);
  }
}
