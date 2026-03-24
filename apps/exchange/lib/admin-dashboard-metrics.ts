import { sql } from "@/lib/db";

function pctDelta(today: number, yesterday: number): number {
  if (yesterday === 0) return today > 0 ? 100 : 0;
  return ((today - yesterday) / yesterday) * 100;
}

export type AdminDashboardPayload = {
  auctionsToday: number;
  auctionsYesterday: number;
  auctionsDeltaPct: number;
  impressionsToday: number;
  impressionsYesterday: number;
  impressionsDeltaPct: number;
  fillRateToday: number;
  fillRateYesterday: number;
  fillRateDeltaPp: number;
  revenueToday: number;
  revenueYesterday: number;
  revenueDeltaPct: number;
  avgCpmToday: number;
  avgCpmYesterday: number;
  avgCpmDeltaPct: number;
  activePublishers: number;
  activeCampaigns: number;
  pendingPublishers: number;
  pendingCampaigns: number;
  pendingReviewTotal: number;
};

export async function computeAdminDashboardMetrics(): Promise<AdminDashboardPayload> {
  const [
    auctionsToday,
    auctionsYesterday,
    impressionsToday,
    impressionsYesterday,
    revToday,
    revYesterday,
    clearedToday,
    aucToday,
    clearedYesterday,
    aucYesterday,
    avgCpmToday,
    avgCpmYesterday,
    activePublishers,
    activeCampaigns,
    pendingPublishers,
    pendingCampaigns
  ] = await Promise.all([
    sql<{ c: number }>`SELECT COUNT(*)::int AS c FROM auction_log WHERE created_at::date = CURRENT_DATE`,
    sql<{ c: number }>`SELECT COUNT(*)::int AS c FROM auction_log WHERE created_at::date = CURRENT_DATE - 1`,
    sql<{ c: number }>`SELECT COUNT(*)::int AS c FROM impressions WHERE created_at::date = CURRENT_DATE`,
    sql<{ c: number }>`SELECT COUNT(*)::int AS c FROM impressions WHERE created_at::date = CURRENT_DATE - 1`,
    sql<{ v: string }>`
      SELECT (COALESCE(SUM(winning_bid), 0) / 1000)::text AS v FROM impressions WHERE created_at::date = CURRENT_DATE
    `,
    sql<{ v: string }>`
      SELECT (COALESCE(SUM(winning_bid), 0) / 1000)::text AS v FROM impressions WHERE created_at::date = CURRENT_DATE - 1
    `,
    sql<{ c: number }>`
      SELECT COUNT(*)::int AS c FROM auction_log
      WHERE created_at::date = CURRENT_DATE AND cleared = true AND winning_campaign_id IS NOT NULL
    `,
    sql<{ c: number }>`SELECT COUNT(*)::int AS c FROM auction_log WHERE created_at::date = CURRENT_DATE`,
    sql<{ c: number }>`
      SELECT COUNT(*)::int AS c FROM auction_log
      WHERE created_at::date = CURRENT_DATE - 1 AND cleared = true AND winning_campaign_id IS NOT NULL
    `,
    sql<{ c: number }>`SELECT COUNT(*)::int AS c FROM auction_log WHERE created_at::date = CURRENT_DATE - 1`,
    sql<{ v: string }>`
      SELECT COALESCE(AVG(winning_bid), 0)::text AS v FROM auction_log
      WHERE cleared = true AND winning_bid IS NOT NULL AND created_at::date = CURRENT_DATE
    `,
    sql<{ v: string }>`
      SELECT COALESCE(AVG(winning_bid), 0)::text AS v FROM auction_log
      WHERE cleared = true AND winning_bid IS NOT NULL AND created_at::date = CURRENT_DATE - 1
    `,
    sql<{ c: number }>`SELECT COUNT(*)::int AS c FROM publishers WHERE status = 'active'`,
    sql<{ c: number }>`SELECT COUNT(*)::int AS c FROM campaigns WHERE status = 'active'`,
    sql<{ c: number }>`SELECT COUNT(*)::int AS c FROM publishers WHERE status = 'pending'`,
    sql<{ c: number }>`SELECT COUNT(*)::int AS c FROM campaigns WHERE status = 'pending'`
  ]);

  const at = Number(auctionsToday.rows[0]?.c ?? 0);
  const ay = Number(auctionsYesterday.rows[0]?.c ?? 0);
  const it = Number(impressionsToday.rows[0]?.c ?? 0);
  const iy = Number(impressionsYesterday.rows[0]?.c ?? 0);
  const rt = Number(revToday.rows[0]?.v ?? 0);
  const ry = Number(revYesterday.rows[0]?.v ?? 0);

  const fillToday = Number(aucToday.rows[0]?.c ?? 0) > 0 ? (Number(clearedToday.rows[0]?.c ?? 0) / Number(aucToday.rows[0]?.c ?? 1)) * 100 : 0;
  const fillYest = Number(aucYesterday.rows[0]?.c ?? 0) > 0 ? (Number(clearedYesterday.rows[0]?.c ?? 0) / Number(aucYesterday.rows[0]?.c ?? 1)) * 100 : 0;

  const act = Number(avgCpmToday.rows[0]?.v ?? 0);
  const acy = Number(avgCpmYesterday.rows[0]?.v ?? 0);

  const pp = Number(pendingPublishers.rows[0]?.c ?? 0);
  const pc = Number(pendingCampaigns.rows[0]?.c ?? 0);

  return {
    auctionsToday: at,
    auctionsYesterday: ay,
    auctionsDeltaPct: pctDelta(at, ay),
    impressionsToday: it,
    impressionsYesterday: iy,
    impressionsDeltaPct: pctDelta(it, iy),
    fillRateToday: fillToday,
    fillRateYesterday: fillYest,
    fillRateDeltaPp: fillToday - fillYest,
    revenueToday: rt,
    revenueYesterday: ry,
    revenueDeltaPct: pctDelta(rt, ry),
    avgCpmToday: act,
    avgCpmYesterday: acy,
    avgCpmDeltaPct: pctDelta(act, acy),
    activePublishers: Number(activePublishers.rows[0]?.c ?? 0),
    activeCampaigns: Number(activeCampaigns.rows[0]?.c ?? 0),
    pendingPublishers: pp,
    pendingCampaigns: pc,
    pendingReviewTotal: pp + pc
  };
}
