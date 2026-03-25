export const dynamic = "force-dynamic";
import { demandAdvertiserFilter } from "@/lib/demand-scope";
import { sql } from "@/lib/db";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest, NextResponse } from "next/server";

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const campaignId = params.id;
  if (!isUuid(campaignId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const auth = await getAuthFromRequest(_req);
  if (!auth) return unauthorized();
  if (auth.role !== "admin" && auth.role !== "demand") return forbidden();

  const campRow = await sql<{ advertiser_name: string | null; advertiser: string | null }>`
    SELECT advertiser_name, advertiser FROM campaigns WHERE id = ${campaignId}::uuid LIMIT 1
  `;
  if (!campRow.rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (auth.role === "demand") {
    const seat = demandAdvertiserFilter(auth);
    const adv = String(campRow.rows[0].advertiser_name ?? campRow.rows[0].advertiser ?? "");
    if (seat && adv !== seat) return forbidden();
  }

  try {
    const [today, allTime, dailyBreakdown, creativeStats, winRateData] = await Promise.all([
      sql<Record<string, string | null>>`
        SELECT
          COUNT(*) FILTER (WHERE al.cleared = true)::text AS impressions,
          COUNT(DISTINCT ck.id)::text AS clicks,
          COALESCE(SUM(CASE WHEN al.cleared = true THEN al.winning_bid / 1000 END), 0)::text AS spend,
          COALESCE(AVG(al.winning_bid) FILTER (WHERE al.cleared = true), 0)::text AS avg_cpm
        FROM auction_log al
        LEFT JOIN impressions i ON i.auction_log_id = al.id AND i.campaign_id = ${campaignId}::uuid
        LEFT JOIN clicks ck ON ck.impression_id = i.id
        WHERE al.winning_campaign_id = ${campaignId}::uuid AND al.created_at::date = CURRENT_DATE
      `,
      sql<Record<string, string | null>>`
        SELECT
          COUNT(*) FILTER (WHERE al.cleared = true)::text AS total_impressions,
          COUNT(DISTINCT ck.id)::text AS total_clicks,
          COALESCE(SUM(CASE WHEN al.cleared = true THEN al.winning_bid / 1000 END), 0)::text AS total_spend
        FROM auction_log al
        LEFT JOIN impressions i ON i.auction_log_id = al.id AND i.campaign_id = ${campaignId}::uuid
        LEFT JOIN clicks ck ON ck.impression_id = i.id
        WHERE al.winning_campaign_id = ${campaignId}::uuid
      `,
      sql<Record<string, unknown>>`
        SELECT date_trunc('day', al.created_at)::date::text AS date,
          COUNT(*) FILTER (WHERE al.cleared = true)::text AS impressions,
          COALESCE(SUM(CASE WHEN al.cleared = true THEN al.winning_bid / 1000 END), 0)::text AS spend,
          COALESCE(AVG(al.winning_bid) FILTER (WHERE al.cleared = true), 0)::text AS avg_cpm
        FROM auction_log al
        WHERE al.winning_campaign_id = ${campaignId}::uuid AND al.created_at > now() - interval '30 days'
        GROUP BY 1 ORDER BY 1 DESC
      `,
      sql<Record<string, unknown>>`
        SELECT cr.id::text, cr.name, cr.size, cr.image_url, cr.status,
          COUNT(DISTINCT i.id)::text AS impressions,
          COUNT(DISTINCT ck.id)::text AS clicks,
          CASE WHEN COUNT(DISTINCT i.id) = 0 THEN '0'::text
            ELSE (COUNT(DISTINCT ck.id)::float / COUNT(DISTINCT i.id) * 100)::text
          END AS ctr
        FROM creatives cr
        LEFT JOIN impressions i ON i.creative_id = cr.id
        LEFT JOIN clicks ck ON ck.impression_id = i.id
        WHERE cr.campaign_id = ${campaignId}::uuid
        GROUP BY cr.id, cr.name, cr.size, cr.image_url, cr.status
      `,
      sql<Record<string, string | null>>`
        SELECT
          COUNT(*)::text AS total_auctions,
          COUNT(*) FILTER (WHERE cleared = true)::text AS won,
          (COUNT(*) FILTER (WHERE cleared = true)::float / NULLIF(COUNT(*), 0) * 100)::text AS win_rate
        FROM auction_log
        WHERE winning_campaign_id = ${campaignId}::uuid AND created_at > now() - interval '7 days'
      `
    ]);

    const t = today.rows[0];
    const a = allTime.rows[0];
    const w = winRateData.rows[0];
    const imps = Number(t?.impressions ?? 0);
    const clk = Number(t?.clicks ?? 0);
    const ctr = imps > 0 ? (clk / imps) * 100 : 0;

    return NextResponse.json({
      today: {
        impressions: imps,
        clicks: clk,
        spend: Number(t?.spend ?? 0).toFixed(2),
        avgCpm: Number(t?.avg_cpm ?? 0).toFixed(2),
        ctr: ctr.toFixed(2)
      },
      allTime: {
        impressions: Number(a?.total_impressions ?? 0),
        clicks: Number(a?.total_clicks ?? 0),
        spend: Number(a?.total_spend ?? 0).toFixed(2)
      },
      winRate7d: Number(w?.win_rate ?? 0).toFixed(1),
      dailyBreakdown: dailyBreakdown.rows,
      creativeStats: creativeStats.rows
    });
  } catch (e) {
    console.error("[campaign-stats]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "failed" }, { status: 500 });
  }
}
