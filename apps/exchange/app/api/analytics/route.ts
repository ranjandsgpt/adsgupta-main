export const dynamic = "force-dynamic";
import { getAdminAnalytics, parseRangeParams } from "@/lib/analytics-queries";
import { sql } from "@/lib/db";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest, NextResponse } from "next/server";

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role !== "admin") return forbidden();

  const sp = request.nextUrl.searchParams;
  const entity = sp.get("entity");

  if (entity === "exchange" || entity === "publisher" || entity === "campaign") {
    const from = sp.get("from") ?? new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
    const to = sp.get("to") ?? new Date().toISOString().split("T")[0];
    const id = sp.get("id");
    if (entity === "publisher" || entity === "campaign") {
      if (!id || !isUuid(id)) {
        return NextResponse.json({ error: "Valid id is required for publisher/campaign" }, { status: 400 });
      }
    }

    try {
      if (entity === "publisher" && id) {
        const [summary, timeseries, byCountry, byDevice, byAdUnit, topCampaigns] = await Promise.all([
          sql<Record<string, string | null>>`
            SELECT
              COUNT(*)::text AS total_auctions,
              COUNT(*) FILTER (WHERE cleared = true)::text AS impressions,
              COALESCE(SUM(CASE WHEN cleared = true THEN winning_bid / 1000 END), 0)::text AS gross_revenue,
              COALESCE(SUM(CASE WHEN cleared = true THEN winning_bid / 1000 * 0.85 END), 0)::text AS publisher_revenue,
              COALESCE(AVG(winning_bid) FILTER (WHERE cleared = true), 0)::text AS avg_cpm,
              (COUNT(*) FILTER (WHERE cleared = true)::float / NULLIF(COUNT(*), 0) * 100)::text AS fill_rate
            FROM auction_log al
            WHERE al.created_at::date >= ${from}::date AND al.created_at::date <= ${to}::date
              AND al.publisher_id = ${id}::uuid
          `,
          sql<Record<string, unknown>>`
            SELECT date_trunc('day', al.created_at)::date::text AS date,
              COUNT(*)::text AS auctions,
              COUNT(*) FILTER (WHERE cleared = true)::text AS impressions,
              COALESCE(SUM(CASE WHEN cleared = true THEN winning_bid / 1000 * 0.85 END), 0)::text AS revenue,
              COALESCE(AVG(winning_bid) FILTER (WHERE cleared = true), 0)::text AS avg_cpm
            FROM auction_log al
            WHERE al.publisher_id = ${id}::uuid
              AND al.created_at::date >= ${from}::date AND al.created_at::date <= ${to}::date
            GROUP BY 1 ORDER BY 1 ASC
          `,
          sql<Record<string, unknown>>`
            SELECT country, COUNT(*)::text AS auctions,
              COUNT(*) FILTER (WHERE cleared = true)::text AS impressions,
              COALESCE(SUM(CASE WHEN cleared = true THEN winning_bid / 1000 * 0.85 END), 0)::text AS revenue
            FROM auction_log al
            WHERE al.publisher_id = ${id}::uuid
              AND al.created_at::date >= ${from}::date AND al.created_at::date <= ${to}::date
              AND country IS NOT NULL
            GROUP BY country ORDER BY revenue DESC NULLS LAST LIMIT 20
          `,
          sql<Record<string, unknown>>`
            SELECT device_type, COUNT(*)::text AS auctions,
              COUNT(*) FILTER (WHERE cleared = true)::text AS impressions
            FROM auction_log al
            WHERE al.publisher_id = ${id}::uuid
              AND al.created_at::date >= ${from}::date AND al.created_at::date <= ${to}::date
              AND device_type IS NOT NULL
            GROUP BY device_type ORDER BY auctions DESC
          `,
          sql<Record<string, unknown>>`
            SELECT u.name AS unit_name, p.domain AS publisher_domain,
              COUNT(*)::text AS auctions,
              COUNT(*) FILTER (WHERE al.cleared = true)::text AS impressions,
              COALESCE(SUM(CASE WHEN al.cleared = true THEN al.winning_bid / 1000 * 0.85 END), 0)::text AS revenue,
              COALESCE(AVG(al.winning_bid) FILTER (WHERE al.cleared = true), 0)::text AS avg_cpm
            FROM auction_log al
            JOIN ad_units u ON al.ad_unit_id = u.id
            JOIN publishers p ON al.publisher_id = p.id
            WHERE al.publisher_id = ${id}::uuid
              AND al.created_at::date >= ${from}::date AND al.created_at::date <= ${to}::date
            GROUP BY u.name, p.domain ORDER BY revenue DESC NULLS LAST LIMIT 10
          `,
          sql<Record<string, unknown>>`
            SELECT c.campaign_name, c.advertiser_name,
              COUNT(*)::text AS auctions_won,
              COALESCE(SUM(al.winning_bid / 1000), 0)::text AS spend,
              COALESCE(AVG(al.winning_bid), 0)::text AS avg_cpm
            FROM auction_log al
            JOIN campaigns c ON al.winning_campaign_id = c.id
            WHERE al.publisher_id = ${id}::uuid AND al.cleared = true
              AND al.created_at::date >= ${from}::date AND al.created_at::date <= ${to}::date
            GROUP BY c.id, c.campaign_name, c.advertiser_name ORDER BY spend DESC NULLS LAST LIMIT 10
          `
        ]);
        return NextResponse.json({ summary: summary.rows[0], timeseries, byCountry, byDevice, topAdUnits: byAdUnit, topCampaigns });
      }

      if (entity === "campaign" && id) {
        const [summary, timeseries, byCountry, byDevice, byAdUnit, topCampaigns] = await Promise.all([
          sql<Record<string, string | null>>`
            SELECT
              COUNT(*)::text AS total_auctions,
              COUNT(*) FILTER (WHERE cleared = true)::text AS impressions,
              COALESCE(SUM(CASE WHEN cleared = true THEN winning_bid / 1000 END), 0)::text AS gross_revenue,
              COALESCE(SUM(CASE WHEN cleared = true THEN winning_bid / 1000 * 0.85 END), 0)::text AS publisher_revenue,
              COALESCE(AVG(winning_bid) FILTER (WHERE cleared = true), 0)::text AS avg_cpm,
              (COUNT(*) FILTER (WHERE cleared = true)::float / NULLIF(COUNT(*), 0) * 100)::text AS fill_rate
            FROM auction_log al
            WHERE al.created_at::date >= ${from}::date AND al.created_at::date <= ${to}::date
              AND al.winning_campaign_id = ${id}::uuid
          `,
          sql<Record<string, unknown>>`
            SELECT date_trunc('day', al.created_at)::date::text AS date,
              COUNT(*)::text AS auctions,
              COUNT(*) FILTER (WHERE cleared = true)::text AS impressions,
              COALESCE(SUM(CASE WHEN cleared = true THEN winning_bid / 1000 * 0.85 END), 0)::text AS revenue,
              COALESCE(AVG(winning_bid) FILTER (WHERE cleared = true), 0)::text AS avg_cpm
            FROM auction_log al
            WHERE al.winning_campaign_id = ${id}::uuid
              AND al.created_at::date >= ${from}::date AND al.created_at::date <= ${to}::date
            GROUP BY 1 ORDER BY 1 ASC
          `,
          sql<Record<string, unknown>>`
            SELECT country, COUNT(*)::text AS auctions,
              COUNT(*) FILTER (WHERE cleared = true)::text AS impressions,
              COALESCE(SUM(CASE WHEN cleared = true THEN winning_bid / 1000 * 0.85 END), 0)::text AS revenue
            FROM auction_log al
            WHERE al.winning_campaign_id = ${id}::uuid
              AND al.created_at::date >= ${from}::date AND al.created_at::date <= ${to}::date
              AND country IS NOT NULL
            GROUP BY country ORDER BY revenue DESC NULLS LAST LIMIT 20
          `,
          sql<Record<string, unknown>>`
            SELECT device_type, COUNT(*)::text AS auctions,
              COUNT(*) FILTER (WHERE cleared = true)::text AS impressions
            FROM auction_log al
            WHERE al.winning_campaign_id = ${id}::uuid
              AND al.created_at::date >= ${from}::date AND al.created_at::date <= ${to}::date
              AND device_type IS NOT NULL
            GROUP BY device_type ORDER BY auctions DESC
          `,
          sql<Record<string, unknown>>`
            SELECT u.name AS unit_name, p.domain AS publisher_domain,
              COUNT(*)::text AS auctions,
              COUNT(*) FILTER (WHERE al.cleared = true)::text AS impressions,
              COALESCE(SUM(CASE WHEN al.cleared = true THEN al.winning_bid / 1000 * 0.85 END), 0)::text AS revenue,
              COALESCE(AVG(al.winning_bid) FILTER (WHERE al.cleared = true), 0)::text AS avg_cpm
            FROM auction_log al
            JOIN ad_units u ON al.ad_unit_id = u.id
            JOIN publishers p ON al.publisher_id = p.id
            WHERE al.winning_campaign_id = ${id}::uuid
              AND al.created_at::date >= ${from}::date AND al.created_at::date <= ${to}::date
            GROUP BY u.name, p.domain ORDER BY revenue DESC NULLS LAST LIMIT 10
          `,
          sql<Record<string, unknown>>`
            SELECT c.campaign_name, c.advertiser_name,
              COUNT(*)::text AS auctions_won,
              COALESCE(SUM(al.winning_bid / 1000), 0)::text AS spend,
              COALESCE(AVG(al.winning_bid), 0)::text AS avg_cpm
            FROM auction_log al
            JOIN campaigns c ON al.winning_campaign_id = c.id
            WHERE al.winning_campaign_id = ${id}::uuid AND al.cleared = true
              AND al.created_at::date >= ${from}::date AND al.created_at::date <= ${to}::date
            GROUP BY c.id, c.campaign_name, c.advertiser_name ORDER BY spend DESC NULLS LAST LIMIT 10
          `
        ]);
        return NextResponse.json({ summary: summary.rows[0], timeseries, byCountry, byDevice, topAdUnits: byAdUnit, topCampaigns });
      }

      const [summary, timeseries, byCountry, byDevice, byAdUnit, topCampaigns] = await Promise.all([
        sql<Record<string, string | null>>`
          SELECT
            COUNT(*)::text AS total_auctions,
            COUNT(*) FILTER (WHERE cleared = true)::text AS impressions,
            COALESCE(SUM(CASE WHEN cleared = true THEN winning_bid / 1000 END), 0)::text AS gross_revenue,
            COALESCE(SUM(CASE WHEN cleared = true THEN winning_bid / 1000 * 0.85 END), 0)::text AS publisher_revenue,
            COALESCE(AVG(winning_bid) FILTER (WHERE cleared = true), 0)::text AS avg_cpm,
            (COUNT(*) FILTER (WHERE cleared = true)::float / NULLIF(COUNT(*), 0) * 100)::text AS fill_rate
          FROM auction_log al
          WHERE al.created_at::date >= ${from}::date AND al.created_at::date <= ${to}::date
        `,
        sql<Record<string, unknown>>`
          SELECT date_trunc('day', al.created_at)::date::text AS date,
            COUNT(*)::text AS auctions,
            COUNT(*) FILTER (WHERE cleared = true)::text AS impressions,
            COALESCE(SUM(CASE WHEN cleared = true THEN winning_bid / 1000 * 0.85 END), 0)::text AS revenue,
            COALESCE(AVG(winning_bid) FILTER (WHERE cleared = true), 0)::text AS avg_cpm
          FROM auction_log al
          WHERE al.created_at::date >= ${from}::date AND al.created_at::date <= ${to}::date
          GROUP BY 1 ORDER BY 1 ASC
        `,
        sql<Record<string, unknown>>`
          SELECT country, COUNT(*)::text AS auctions,
            COUNT(*) FILTER (WHERE cleared = true)::text AS impressions,
            COALESCE(SUM(CASE WHEN cleared = true THEN winning_bid / 1000 * 0.85 END), 0)::text AS revenue
          FROM auction_log al
          WHERE al.created_at::date >= ${from}::date AND al.created_at::date <= ${to}::date
            AND country IS NOT NULL
          GROUP BY country ORDER BY revenue DESC NULLS LAST LIMIT 20
        `,
        sql<Record<string, unknown>>`
          SELECT device_type, COUNT(*)::text AS auctions,
            COUNT(*) FILTER (WHERE cleared = true)::text AS impressions
          FROM auction_log al
          WHERE al.created_at::date >= ${from}::date AND al.created_at::date <= ${to}::date
            AND device_type IS NOT NULL
          GROUP BY device_type ORDER BY auctions DESC
        `,
        sql<Record<string, unknown>>`
          SELECT u.name AS unit_name, p.domain AS publisher_domain,
            COUNT(*)::text AS auctions,
            COUNT(*) FILTER (WHERE al.cleared = true)::text AS impressions,
            COALESCE(SUM(CASE WHEN al.cleared = true THEN al.winning_bid / 1000 * 0.85 END), 0)::text AS revenue,
            COALESCE(AVG(al.winning_bid) FILTER (WHERE al.cleared = true), 0)::text AS avg_cpm
          FROM auction_log al
          JOIN ad_units u ON al.ad_unit_id = u.id
          JOIN publishers p ON al.publisher_id = p.id
          WHERE al.created_at::date >= ${from}::date AND al.created_at::date <= ${to}::date
          GROUP BY u.name, p.domain ORDER BY revenue DESC NULLS LAST LIMIT 10
        `,
        sql<Record<string, unknown>>`
          SELECT c.campaign_name, c.advertiser_name,
            COUNT(*)::text AS auctions_won,
            COALESCE(SUM(al.winning_bid / 1000), 0)::text AS spend,
            COALESCE(AVG(al.winning_bid), 0)::text AS avg_cpm
          FROM auction_log al
          JOIN campaigns c ON al.winning_campaign_id = c.id
          WHERE al.cleared = true
            AND al.created_at::date >= ${from}::date AND al.created_at::date <= ${to}::date
          GROUP BY c.id, c.campaign_name, c.advertiser_name ORDER BY spend DESC NULLS LAST LIMIT 10
        `
      ]);
      return NextResponse.json({ summary: summary.rows[0], timeseries, byCountry, byDevice, topAdUnits: byAdUnit, topCampaigns });
    } catch (e) {
      console.error("[analytics rollup]", e);
      return NextResponse.json({ error: e instanceof Error ? e.message : "failed" }, { status: 500 });
    }
  }

  const dr = parseRangeParams({
    range: sp.get("range"),
    from: sp.get("from"),
    to: sp.get("to")
  });

  try {
    const data = await getAdminAnalytics({
      fromStr: dr.fromStr,
      toStr: dr.toStr,
      publisherId: sp.get("publisherId") ?? sp.get("publisher_id"),
      campaignId: sp.get("campaignId") ?? sp.get("campaign_id")
    });
    return NextResponse.json(data);
  } catch (e) {
    console.error("[analytics]", e);
    return NextResponse.json({ error: "Analytics query failed" }, { status: 500 });
  }
}
