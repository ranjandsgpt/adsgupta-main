export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest, NextResponse } from "next/server";

/** GDPR-style retention: purge rows older than 90 days (admin only). */
export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role !== "admin") return forbidden();

  const started = Date.now();
  try {
    const cutoff = "90 days";
    const clk = await sql`
      WITH d AS (
        DELETE FROM clicks WHERE created_at < NOW() - INTERVAL '90 days' RETURNING id
      )
      SELECT COUNT(*)::int AS c FROM d
    `;
    const impr = await sql`
      WITH d AS (
        DELETE FROM impressions WHERE created_at < NOW() - INTERVAL '90 days' RETURNING id
      )
      SELECT COUNT(*)::int AS c FROM d
    `;
    const auc = await sql`
      WITH d AS (
        DELETE FROM auction_log WHERE created_at < NOW() - INTERVAL '90 days' RETURNING id
      )
      SELECT COUNT(*)::int AS c FROM d
    `;

    const auctionLogDeleted = Number(auc.rows[0]?.c ?? 0);
    const impressionsDeleted = Number(impr.rows[0]?.c ?? 0);
    const clicksDeleted = Number(clk.rows[0]?.c ?? 0);

    console.log("[data-cleanup]", { auctionLogDeleted, impressionsDeleted, clicksDeleted, cutoff });

    return NextResponse.json(
      {
        ok: true,
        retention: cutoff,
        deleted: {
          auction_log: auctionLogDeleted,
          impressions: impressionsDeleted,
          clicks: clicksDeleted
        }
      },
      {
        headers: {
          "X-Response-Time": `${Date.now() - started}ms`
        }
      }
    );
  } catch (e) {
    console.error("[data-cleanup]", e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "cleanup failed" },
      { status: 500 }
    );
  }
}
