export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { isClickFraud } from "@/lib/ivt-detector";
import { getClientIp } from "@/lib/rate-limiter";
import { NextRequest, NextResponse } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-MDE-Version"
};

/** `id` = impression UUID; `url` = encoded destination. */
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  const impressionId = request.nextUrl.searchParams.get("id");
  const urlRaw = request.nextUrl.searchParams.get("url");

  let destination = "https://adsgupta.com";
  if (urlRaw != null && urlRaw !== "") {
    try {
      destination = decodeURIComponent(urlRaw);
    } catch {
      destination = urlRaw;
    }
  }

  const redirect = () => {
    const res = NextResponse.redirect(destination, 302);
    for (const [k, v] of Object.entries(CORS_HEADERS)) res.headers.set(k, v);
    return res;
  };

  if (!impressionId) {
    return redirect();
  }

  try {
    const ip = getClientIp(request);
    if (isClickFraud(ip)) {
      return redirect();
    }
    const imp = await sql<{ id: string; campaign_id: string | null }>`
      SELECT id, campaign_id::text AS campaign_id FROM impressions WHERE id = ${impressionId} LIMIT 1
    `;
    const row = imp.rows[0];
    if (row) {
      const clickIns = await sql<{ click_id: string }>`
        INSERT INTO clicks (impression_id, campaign_id, click_url)
        VALUES (${row.id}, ${row.campaign_id}, ${destination})
        RETURNING id::text AS click_id
      `;
      const clickId = clickIns.rows[0]?.click_id;
      if (clickId) {
        void (async () => {
          try {
            const ck = await sql<{
              campaign_id: string | null;
              creative_id: string | null;
              impression_id: string;
              ad_unit_id: string | null;
              country: string | null;
              device_type: string | null;
            }>`
              SELECT
                i.campaign_id::text AS campaign_id,
                i.creative_id::text AS creative_id,
                c.impression_id::text AS impression_id,
                al.ad_unit_id::text AS ad_unit_id,
                al.country,
                al.device_type
              FROM clicks c
              JOIN impressions i ON c.impression_id = i.id
              JOIN auction_log al ON i.auction_log_id = al.id
              WHERE c.id = ${clickId}::uuid
              LIMIT 1
            `;
            if (!ck.rows.length) return;
            const r = ck.rows[0]!;
            const ctry = r.country?.trim() || "ALL";
            const dvt = r.device_type?.trim() || "ALL";

            await Promise.all([
              r.creative_id
                ? sql`UPDATE creatives SET clicks = COALESCE(clicks, 0) + 1 WHERE id = ${r.creative_id}::uuid`
                : Promise.resolve(),
              r.campaign_id
                ? sql`
                    INSERT INTO campaign_perf_daily (
                      date, campaign_id, impressions, clicks, spend, bids_won, country, device_type
                    )
                    VALUES (CURRENT_DATE, ${r.campaign_id}::uuid, 0, 1, 0, 0, ${ctry}, ${dvt})
                    ON CONFLICT (date, campaign_id, country, device_type) DO UPDATE SET
                      clicks = campaign_perf_daily.clicks + 1
                  `
                : Promise.resolve(),
              r.ad_unit_id
                ? sql`
                    UPDATE revenue_daily SET clicks = COALESCE(clicks, 0) + 1
                    WHERE date = CURRENT_DATE
                      AND ad_unit_id = ${r.ad_unit_id}::uuid
                      AND country = ${ctry}
                      AND device_type = ${dvt}
                      AND demand_source = 'ALL'
                  `
                : Promise.resolve()
            ]);
          } catch (e) {
            console.error("[click/async]", e instanceof Error ? e.message : e);
          }
        })();
      }
    }
  } catch (e) {
    console.error("[click]", e);
  }

  return redirect();
}
