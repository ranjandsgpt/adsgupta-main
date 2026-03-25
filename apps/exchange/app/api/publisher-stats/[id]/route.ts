import { computeExchangeStats } from "@/lib/stats-queries";
import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const revalidate = 60;

/**
 * Publisher-scoped metrics from real aggregates; extends `computeExchangeStats` with health score sync.
 */
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await computeExchangeStats(params.id);

    const healthScore = await sql<{ score: string }>`
      SELECT (
        LEAST(100, GREATEST(0, (
          COALESCE(COUNT(*) FILTER (WHERE cleared = true)::float / NULLIF(COUNT(*), 0) * 40, 0) +
          LEAST(40, COALESCE(AVG(winning_bid) FILTER (WHERE cleared = true) / 5 * 20, 0)) +
          20
        )))::text AS score
      FROM auction_log
      WHERE publisher_id = ${params.id}::uuid AND created_at > now() - interval '7 days'
    `;
    const hs = Math.round(Number(healthScore.rows[0]?.score ?? 0));

    void sql`UPDATE publishers SET health_score = ${hs} WHERE id = ${params.id}::uuid`.catch(() => {});

    return NextResponse.json({
      ...payload,
      healthScore: hs
    });
  } catch (e) {
    console.error("[publisher-stats]", e);
    return NextResponse.json({ error: "Failed to load publisher stats" }, { status: 500 });
  }
}
