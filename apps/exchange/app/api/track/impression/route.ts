export const dynamic = "force-dynamic";
import { checkBudgetAndPause } from "@/lib/campaign-budget";
import { sql } from "@/lib/db";
import { isDuplicateImpression } from "@/lib/ivt-detector";
import { fireWebhooksAsync } from "@/lib/webhooks";
import { NextRequest, NextResponse } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-MDE-Version"
};

/** 1x1 transparent GIF (exact spec). */
const GIF_1X1 = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

const headers = {
  "Content-Type": "image/gif",
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  ...CORS_HEADERS
};

/** `id` = `auction_log.id` (UUID). Inserts impression once per log row. */
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  const gifResponse = new NextResponse(GIF_1X1, { headers });
  const logId = request.nextUrl.searchParams.get("id");

  if (!logId || isDuplicateImpression(logId)) {
    return gifResponse;
  }

  void (async () => {
    try {
      const ins = await sql<{ id: string }>`
        INSERT INTO impressions (
          auction_log_id,
          auction_id,
          ad_unit_id,
          campaign_id,
          creative_id,
          winning_bid,
          page_url,
          user_id,
          session_id,
          country,
          device_type
        )
        SELECT
          al.id,
          al.auction_id,
          al.ad_unit_id,
          al.winning_campaign_id,
          al.winning_creative_id,
          al.winning_bid,
          al.page_url,
          al.raw_signals->'user'->>'id',
          COALESCE(
            al.raw_signals->'user'->'ext'->>'sessionId',
            al.raw_signals->'mde_client'->'session'->>'sessionId'
          ),
          al.country,
          al.device_type
        FROM auction_log al
        WHERE al.id = ${logId}::uuid AND al.ad_unit_id IS NOT NULL AND al.winning_campaign_id IS NOT NULL
        ON CONFLICT (auction_log_id) DO NOTHING
        RETURNING id
      `;

      let impressionId = ins.rows[0]?.id;
      if (!impressionId) {
        const ex = await sql<{ id: string }>`
          SELECT id FROM impressions WHERE auction_log_id = ${logId}::uuid LIMIT 1
        `;
        impressionId = ex.rows[0]?.id;
      }
      if (!impressionId) return;

      const impression = await sql<{
        id: string;
        winning_campaign_id: string | null;
        winning_creative_id: string | null;
        ad_unit_id: string | null;
        publisher_id: string | null;
        winning_bid: string | null;
        country: string | null;
        device_type: string | null;
      }>`
        SELECT
          i.id,
          al.winning_campaign_id::text AS winning_campaign_id,
          al.winning_creative_id::text AS winning_creative_id,
          al.ad_unit_id::text AS ad_unit_id,
          al.publisher_id::text AS publisher_id,
          al.winning_bid::text AS winning_bid,
          al.country,
          al.device_type
        FROM impressions i
        JOIN auction_log al ON i.auction_log_id = al.id
        WHERE i.id = ${impressionId}
        LIMIT 1
      `;
      if (!impression.rows.length) return;
      const imp = impression.rows[0]!;
      if (!imp.winning_campaign_id || !imp.ad_unit_id || !imp.publisher_id) return;

      const wb = imp.winning_bid != null ? Number(imp.winning_bid) : 0;
      const spendImp = wb / 1000;
      const pubRev = (wb * 0.85) / 1000;
      const ctry = imp.country?.trim() || "UNKNOWN";
      const dvt = imp.device_type?.trim() || "UNKNOWN";

      await Promise.all([
        sql`
          UPDATE campaigns SET
            impressions_today = COALESCE(impressions_today, 0) + 1,
            total_impressions = COALESCE(total_impressions, 0) + 1,
            last_impression_at = now(),
            spend_today = COALESCE(spend_today, 0) + ${spendImp},
            total_spend = COALESCE(total_spend, 0) + ${spendImp}
          WHERE id = ${imp.winning_campaign_id}::uuid
        `,
        imp.winning_creative_id
          ? sql`
              UPDATE creatives SET
                impressions = COALESCE(impressions, 0) + 1,
                last_served_at = now()
              WHERE id = ${imp.winning_creative_id}::uuid
            `
          : Promise.resolve(),
        sql`
          UPDATE ad_units SET
            impressions_today = COALESCE(impressions_today, 0) + 1,
            revenue_today = COALESCE(revenue_today, 0) + ${pubRev}
          WHERE id = ${imp.ad_unit_id}::uuid
        `,
        sql`
          UPDATE publishers SET
            impressions_today = COALESCE(impressions_today, 0) + 1,
            revenue_today = COALESCE(revenue_today, 0) + ${pubRev},
            total_revenue = COALESCE(total_revenue, 0) + ${pubRev}
          WHERE id = ${imp.publisher_id}::uuid
        `,
        sql`
          INSERT INTO revenue_daily (
            date, publisher_id, ad_unit_id, impressions, clicks, revenue, bid_requests,
            fill_rate, avg_cpm, country, device_type, demand_source
          )
          VALUES (
            CURRENT_DATE, ${imp.publisher_id}::uuid, ${imp.ad_unit_id}::uuid,
            1, 0, ${pubRev}, 1, 100, ${wb}, ${ctry}, ${dvt}, 'ALL'
          )
          ON CONFLICT (date, publisher_id, ad_unit_id, country, device_type, demand_source) DO UPDATE SET
            impressions = revenue_daily.impressions + 1,
            revenue = revenue_daily.revenue + ${pubRev},
            bid_requests = revenue_daily.bid_requests + 1,
            avg_cpm = (revenue_daily.revenue + ${pubRev}) / (revenue_daily.impressions + 1) * 1000
        `,
        sql`
          INSERT INTO campaign_perf_daily (
            date, campaign_id, impressions, clicks, spend, bids_won, avg_winning_cpm,
            country, device_type
          )
          VALUES (
            CURRENT_DATE, ${imp.winning_campaign_id}::uuid, 1, 0, ${spendImp}, 1, ${wb},
            ${ctry}, ${dvt}
          )
          ON CONFLICT (date, campaign_id, country, device_type) DO UPDATE SET
            impressions = campaign_perf_daily.impressions + 1,
            spend = campaign_perf_daily.spend + ${spendImp},
            bids_won = campaign_perf_daily.bids_won + 1,
            avg_winning_cpm =
              (campaign_perf_daily.spend + ${spendImp}) / (campaign_perf_daily.bids_won + 1) * 1000
        `
      ]);

      fireWebhooksAsync("impression.served", {
        publisherId: imp.publisher_id,
        campaignId: imp.winning_campaign_id,
        cpm: wb
      });
      void checkBudgetAndPause(imp.winning_campaign_id, spendImp);
    } catch (e) {
      console.error("[impression/async]", e instanceof Error ? e.message : e);
    }
  })();

  return gifResponse;
}
