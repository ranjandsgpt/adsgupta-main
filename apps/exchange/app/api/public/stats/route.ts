export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export type PublicStatsPayload = {
  auctionsToday: number;
  activePublishers: number;
  activeCampaigns: number;
  avgCpmLast7d: number;
  totalImpressions7d: number;
  fillRateLast7d: number;
  /** @deprecated use avgCpmLast7d */
  avgCpm?: number;
  topCategories: Array<{ name: string; icon: string }>;
};

export async function GET() {
  try {
    const [pubs, camps, impr, cpm, auctionsToday, filled7d, totalAuctions7d] = await Promise.all([
      sql<{ c: string }>`SELECT COUNT(*)::text AS c FROM publishers WHERE status = 'active'`,
      sql<{ c: string }>`SELECT COUNT(*)::text AS c FROM campaigns WHERE status = 'active'`,
      sql<{ c: string }>`
        SELECT COUNT(*)::text AS c FROM impressions
        WHERE created_at >= now() - interval '7 days'
      `,
      sql<{ v: string | null }>`
        SELECT (AVG(winning_bid))::text AS v FROM impressions
        WHERE created_at >= now() - interval '7 days' AND winning_bid IS NOT NULL
      `,
      sql<{ c: string }>`
        SELECT COUNT(*)::text AS c FROM auction_log
        WHERE created_at::date = CURRENT_DATE
      `,
      sql<{ c: string }>`
        SELECT COUNT(*)::text AS c FROM auction_log
        WHERE created_at >= now() - interval '7 days'
          AND cleared = true
          AND winning_campaign_id IS NOT NULL
      `,
      sql<{ c: string }>`
        SELECT COUNT(*)::text AS c FROM auction_log
        WHERE created_at >= now() - interval '7 days'
      `
    ]);

    const avg = Number(cpm.rows[0]?.v ?? 0);
    const totA = Number(totalAuctions7d.rows[0]?.c ?? 0);
    const fil = Number(filled7d.rows[0]?.c ?? 0);
    const fillRateLast7d = totA > 0 ? Math.min(100, (fil / totA) * 100) : 0;

    const payload: PublicStatsPayload = {
      auctionsToday: Number(auctionsToday.rows[0]?.c ?? 0),
      activePublishers: Number(pubs.rows[0]?.c ?? 0),
      activeCampaigns: Number(camps.rows[0]?.c ?? 0),
      avgCpmLast7d: avg,
      totalImpressions7d: Number(impr.rows[0]?.c ?? 0),
      fillRateLast7d,
      avgCpm: avg,
      topCategories: [
        { name: "Technology", icon: "📱" },
        { name: "News", icon: "📰" },
        { name: "Entertainment", icon: "🎬" }
      ]
    };
    return NextResponse.json(payload);
  } catch (e) {
    console.error("[public/stats]", e instanceof Error ? e.message : e);
    const fallback: PublicStatsPayload = {
      auctionsToday: 0,
      activePublishers: 0,
      activeCampaigns: 0,
      avgCpmLast7d: 0,
      totalImpressions7d: 0,
      fillRateLast7d: 0,
      avgCpm: 0,
      topCategories: []
    };
    return NextResponse.json(fallback, { status: 200 });
  }
}
