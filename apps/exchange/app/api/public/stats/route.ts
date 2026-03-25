export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-MDE-Version",
  "Cache-Control": "public, max-age=30"
};

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

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}

function catIcon(_name: string): string {
  return "📊";
}

export async function GET() {
  try {
    const [auctions, publishers, campaigns, fillRate, cpmData, impr, topCats] = await Promise.all([
      sql<{ c: string }>`SELECT COUNT(*)::text AS c FROM auction_log WHERE created_at::date = CURRENT_DATE`,
      sql<{ c: string }>`SELECT COUNT(*)::text AS c FROM publishers WHERE status = 'active'`,
      sql<{ c: string }>`SELECT COUNT(*)::text AS c FROM campaigns WHERE status = 'active'`,
      sql<{ fr: string | null }>`
        SELECT
          (COUNT(*) FILTER (WHERE cleared = true)::float / NULLIF(COUNT(*), 0) * 100)::text AS fr
        FROM auction_log
        WHERE created_at > now() - interval '7 days'
      `,
      sql<{ v: string | null }>`
        SELECT AVG(winning_bid)::text AS v
        FROM auction_log
        WHERE cleared = true AND winning_bid IS NOT NULL AND created_at > now() - interval '7 days'
      `,
      sql<{ c: string }>`
        SELECT COUNT(*)::text AS c FROM impressions
        WHERE created_at >= now() - interval '7 days'
      `,
      sql<{ cat: string; c: string }>`
        SELECT u.cat, COUNT(*)::text AS c
        FROM auction_log al
        CROSS JOIN LATERAL unnest(COALESCE(al.iab_categories, ARRAY[]::text[])) AS u(cat)
        WHERE al.created_at > now() - interval '30 days'
          AND COALESCE(trim(u.cat), '') <> ''
        GROUP BY u.cat
        ORDER BY COUNT(*) DESC
        LIMIT 5
      `
    ]);

    const fillPct = fillRate.rows[0]?.fr != null ? Number(fillRate.rows[0].fr) : 0;
    const avgCpm = Number(cpmData.rows[0]?.v ?? 0);

    const payload: PublicStatsPayload = {
      auctionsToday: Number(auctions.rows[0]?.c ?? 0),
      activePublishers: Number(publishers.rows[0]?.c ?? 0),
      activeCampaigns: Number(campaigns.rows[0]?.c ?? 0),
      avgCpmLast7d: Math.round(avgCpm * 100) / 100,
      totalImpressions7d: Number(impr.rows[0]?.c ?? 0),
      fillRateLast7d: Math.round(fillPct * 10) / 10,
      avgCpm: Math.round(avgCpm * 100) / 100,
      topCategories: topCats.rows.map((r) => ({
        name: r.cat,
        icon: catIcon(r.cat)
      }))
    };
    return NextResponse.json(payload, { headers: CORS_HEADERS });
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
    return NextResponse.json(fallback, { status: 200, headers: CORS_HEADERS });
  }
}
