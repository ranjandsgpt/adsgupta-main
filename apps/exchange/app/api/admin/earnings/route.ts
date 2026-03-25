export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth) return unauthorized();
    if (auth.role !== "admin") return forbidden();

    const month = request.nextUrl.searchParams.get("month")?.trim();
    const now = new Date();
    const y = month ? Number(month.slice(0, 4)) : now.getFullYear();
    const m = month ? Number(month.slice(5, 7)) : now.getMonth() + 1;
    if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) {
      return json({ error: "Invalid month (YYYY-MM)" }, 400);
    }

    const period = `${y}-${String(m).padStart(2, "0")}`;
    const periodStart = `${period}-01`;
    const nextMonthStart = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;

    const total = await sql<{ rev: string }>`
      SELECT (COALESCE(SUM(i.winning_bid), 0) / 1000)::text AS rev
      FROM impressions i
      INNER JOIN ad_units u ON u.id = i.ad_unit_id
      WHERE i.created_at >= ${periodStart}::date
        AND i.created_at < ${nextMonthStart}::date
    `;

    const py = m === 1 ? y - 1 : y;
    const pm = m === 1 ? 12 : m - 1;
    const prevStart = `${py}-${String(pm).padStart(2, "0")}-01`;
    const prevNext =
      pm === 12 ? `${py + 1}-01-01` : `${py}-${String(pm + 1).padStart(2, "0")}-01`;

    const prevRev = await sql<{ rev: string }>`
      SELECT (COALESCE(SUM(i.winning_bid), 0) / 1000)::text AS rev
      FROM impressions i
      INNER JOIN ad_units u ON u.id = i.ad_unit_id
      WHERE i.created_at >= ${prevStart}::date
        AND i.created_at < ${prevNext}::date
    `;

    const currentRev = Number(total.rows[0]?.rev ?? 0);
    const previousRev = Number(prevRev.rows[0]?.rev ?? 0);
    const momGrowth =
      previousRev > 0 ? ((currentRev - previousRev) / previousRev) * 100 : currentRev > 0 ? 100 : 0;

    const top = await sql<{
      publisher_id: string;
      name: string;
      revenue: string;
    }>`
      SELECT
        p.id AS publisher_id,
        p.name,
        (COALESCE(SUM(i.winning_bid), 0) / 1000)::text AS revenue
      FROM publishers p
      INNER JOIN ad_units u ON u.publisher_id = p.id
      INNER JOIN impressions i ON i.ad_unit_id = u.id
      WHERE i.created_at >= ${periodStart}::date
        AND i.created_at < ${nextMonthStart}::date
      GROUP BY p.id, p.name
      ORDER BY SUM(i.winning_bid) DESC NULLS LAST
      LIMIT 10
    `;

    const all = await sql<{
      publisher_id: string;
      name: string;
      revenue: string;
    }>`
      SELECT
        p.id AS publisher_id,
        p.name,
        (COALESCE(SUM(i.winning_bid), 0) / 1000)::text AS revenue
      FROM publishers p
      INNER JOIN ad_units u ON u.publisher_id = p.id
      INNER JOIN impressions i ON i.ad_unit_id = u.id
      WHERE i.created_at >= ${periodStart}::date
        AND i.created_at < ${nextMonthStart}::date
      GROUP BY p.id, p.name
      ORDER BY SUM(i.winning_bid) DESC NULLS LAST
    `;

    return json({
      period,
      platformRevenueGross: currentRev,
      platformFee: currentRev * 0.15,
      publisherShare: currentRev * 0.85,
      monthOverMonthGrowthPct: momGrowth,
      topPublishers: top.rows.map((r) => ({
        publisherId: r.publisher_id,
        name: r.name,
        revenue: Number(r.revenue)
      })),
      allPublishers: all.rows.map((r) => ({
        publisherId: r.publisher_id,
        name: r.name,
        revenue: Number(r.revenue)
      }))
    });
  } catch (e) {
    console.error("[api/admin/earnings GET]", e instanceof Error ? e.message : e);
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
