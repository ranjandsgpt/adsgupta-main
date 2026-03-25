export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

/** Daily impression estimate from historical auction clears at or below bid (7d avg). */
export async function GET(request: NextRequest) {
  const bidRaw = request.nextUrl.searchParams.get("bid");
  const bid = bidRaw != null ? Number(bidRaw) : NaN;
  if (!Number.isFinite(bid) || bid <= 0) {
    return NextResponse.json({ estimatedDailyImpressions: 0 });
  }

  try {
    const result = await sql<{ c: string }>`
      SELECT COUNT(*)::text AS c FROM auction_log
      WHERE cleared = true
        AND winning_bid IS NOT NULL
        AND winning_bid <= ${bid}
        AND created_at >= now() - interval '7 days'
    `;
    const week = Number(result.rows[0]?.c ?? 0);
    return NextResponse.json({ estimatedDailyImpressions: Math.round(week / 7) });
  } catch (e) {
    console.error("[bid-estimate]", e);
    return NextResponse.json({ estimatedDailyImpressions: 0 });
  }
}
