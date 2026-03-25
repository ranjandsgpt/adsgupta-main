export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const pubs = await sql<{ c: string }>`
      SELECT COUNT(*)::text AS c FROM publishers WHERE status = 'active'
    `;
    const impr = await sql<{ c: string }>`
      SELECT COUNT(*)::text AS c FROM impressions
      WHERE created_at >= now() - interval '7 days'
    `;
    const cpm = await sql<{ v: string | null }>`
      SELECT (AVG(winning_bid))::text AS v FROM impressions
      WHERE created_at >= now() - interval '7 days' AND winning_bid IS NOT NULL
    `;
    return NextResponse.json({
      activePublishers: Number(pubs.rows[0]?.c ?? 0),
      totalImpressions7d: Number(impr.rows[0]?.c ?? 0),
      avgCpm: Number(cpm.rows[0]?.v ?? 0),
      topCategories: [
        { name: "Technology", icon: "📱" },
        { name: "News", icon: "📰" },
        { name: "Entertainment", icon: "🎬" }
      ]
    });
  } catch (e) {
    console.error("[public/stats]", e);
    return NextResponse.json(
      {
        activePublishers: 0,
        totalImpressions7d: 0,
        avgCpm: 0,
        topCategories: []
      },
      { status: 200 }
    );
  }
}
