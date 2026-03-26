export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

const FEE = 0.15;

export async function GET(request: NextRequest, { params }: { params: { publisherId: string } }) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  const publisherId = params.publisherId?.trim() ?? "";
  if (!publisherId) return json({ error: "publisherId required" }, 400);
  if (auth.role === "publisher") {
    const allowed = (auth.publisherIds ?? (auth.publisherId ? [auth.publisherId] : [])).filter(Boolean);
    if (!allowed.includes(publisherId)) return forbidden();
  }
  if (auth.role !== "publisher" && auth.role !== "admin") return forbidden();

  const month = request.nextUrl.searchParams.get("month")?.trim();
  const now = new Date();
  const y = month ? Number(month.slice(0, 4)) : now.getFullYear();
  const m = month ? Number(month.slice(5, 7)) : now.getMonth() + 1;
  if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) {
    return json({ error: "Invalid month (use YYYY-MM)" }, 400);
  }

  const period = `${y}-${String(m).padStart(2, "0")}`;
  const periodStart = `${y}-${String(m).padStart(2, "0")}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const periodEnd = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  const nextMonthStart = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;

  const pub = await sql<{ id: string; name: string; domain: string; created_at: string }>`
    SELECT id, name, domain, created_at::text FROM publishers WHERE id = ${publisherId} LIMIT 1
  `;
  const p = pub.rows[0];
  if (!p) return json({ error: "Publisher not found" }, 404);

  const sumImp = await sql<{ c: string; rev: string }>`
    SELECT
      COUNT(*)::text AS c,
      (COALESCE(SUM(i.winning_bid), 0) / 1000)::text AS rev
    FROM impressions i
    INNER JOIN ad_units u ON u.id = i.ad_unit_id
    WHERE u.publisher_id = ${publisherId}
      AND i.created_at >= ${periodStart}::date
      AND i.created_at < ${nextMonthStart}::date
  `;

  const clicks = await sql<{ c: string }>`
    SELECT COUNT(*)::text AS c
    FROM clicks c
    INNER JOIN impressions i ON i.id = c.impression_id
    INNER JOIN ad_units u ON u.id = i.ad_unit_id
    WHERE u.publisher_id = ${publisherId}
      AND c.created_at >= ${periodStart}::date
      AND c.created_at < ${nextMonthStart}::date
  `;

  const auctions = await sql<{ c: string }>`
    SELECT COUNT(*)::text AS c
    FROM auction_log al
    INNER JOIN ad_units u ON u.id = al.ad_unit_id
    WHERE u.publisher_id = ${publisherId}
      AND al.created_at >= ${periodStart}::date
      AND al.created_at < ${nextMonthStart}::date
  `;

  const totalImpressions = Number(sumImp.rows[0]?.c ?? 0);
  const totalClicks = Number(clicks.rows[0]?.c ?? 0);
  const totalAuctions = Number(auctions.rows[0]?.c ?? 0);
  const totalRevenue = Number(sumImp.rows[0]?.rev ?? 0);
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const fillRate = totalAuctions > 0 ? (totalImpressions / totalAuctions) * 100 : 0;
  const avgCpm = totalImpressions > 0 ? (totalRevenue / totalImpressions) * 1000 : 0;
  const platformFee = totalRevenue * FEE;
  const publisherEarnings = totalRevenue * (1 - FEE);

  const byUnit = await sql<{
    unit_id: string;
    unit_name: string;
    impressions: string;
    revenue: string;
    auctions: string;
  }>`
    SELECT
      u.id AS unit_id,
      u.name AS unit_name,
      COUNT(i.id)::text AS impressions,
      (COALESCE(SUM(i.winning_bid), 0) / 1000)::text AS revenue,
      (
        SELECT COUNT(*)::text FROM auction_log al
        WHERE al.ad_unit_id = u.id
          AND al.created_at >= ${periodStart}::date
          AND al.created_at < ${nextMonthStart}::date
      ) AS auctions
    FROM ad_units u
    LEFT JOIN impressions i ON i.ad_unit_id = u.id
      AND i.created_at >= ${periodStart}::date
      AND i.created_at < ${nextMonthStart}::date
    WHERE u.publisher_id = ${publisherId}
    GROUP BY u.id, u.name
    ORDER BY u.name
  `;

  const impDaily = await sql<{ d: string; impressions: string; revenue: string }>`
    SELECT
      im.created_at::date::text AS d,
      COUNT(*)::text AS impressions,
      (COALESCE(SUM(im.winning_bid), 0) / 1000)::text AS revenue
    FROM impressions im
    INNER JOIN ad_units u ON u.id = im.ad_unit_id
    WHERE u.publisher_id = ${publisherId}
      AND im.created_at >= ${periodStart}::date
      AND im.created_at < ${nextMonthStart}::date
    GROUP BY im.created_at::date
    ORDER BY 1
  `;

  const aucDaily = await sql<{ d: string; auctions: string }>`
    SELECT
      al.created_at::date::text AS d,
      COUNT(*)::text AS auctions
    FROM auction_log al
    INNER JOIN ad_units u ON u.id = al.ad_unit_id
    WHERE u.publisher_id = ${publisherId}
      AND al.created_at >= ${periodStart}::date
      AND al.created_at < ${nextMonthStart}::date
    GROUP BY al.created_at::date
    ORDER BY 1
  `;

  const aucMap = new Map(aucDaily.rows.map((r) => [r.d.slice(0, 10), Number(r.auctions)]));
  const impMap = new Map(
    impDaily.rows.map((r) => [r.d.slice(0, 10), { im: Number(r.impressions), rev: Number(r.revenue) }])
  );

  const dailyBreakdown: Array<{ date: string; impressions: number; revenue: number; fillRate: number }> = [];
  for (let day = 1; day <= lastDay; day++) {
    const key = `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const im = impMap.get(key)?.im ?? 0;
    const rev = impMap.get(key)?.rev ?? 0;
    const auc = aucMap.get(key) ?? 0;
    dailyBreakdown.push({
      date: key,
      impressions: im,
      revenue: rev,
      fillRate: auc > 0 ? (im / auc) * 100 : 0
    });
  }

  const byUnitOut = byUnit.rows.map((r) => {
    const im = Number(r.impressions);
    const rev = Number(r.revenue);
    const ac = Number(r.auctions ?? 0);
    return {
      unitId: r.unit_id,
      unitName: r.unit_name,
      impressions: im,
      revenue: rev,
      avgCpm: im > 0 ? (rev / im) * 1000 : 0,
      fillRate: ac > 0 ? (im / ac) * 100 : 0
    };
  });

  const statement = {
    publisherId,
    publisherName: p.name,
    domain: p.domain,
    period,
    periodStart,
    periodEnd,
    summary: {
      totalImpressions,
      totalClicks,
      avgCtr,
      totalRevenue,
      platformFee,
      publisherEarnings,
      avgCpm,
      fillRate
    },
    byUnit: byUnitOut,
    dailyBreakdown
  };

  return json(statement);
}
