export const dynamic = "force-dynamic";
import { demandAdvertiserFilter } from "@/lib/demand-scope";
import { sql } from "@/lib/db";
import { badRequest, json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

type CampaignRow = Record<string, unknown>;

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  const email = request.nextUrl.searchParams.get("email");

  try {
    if (!auth && email) {
      const result = await sql<CampaignRow>`
        SELECT
          c.*,
          (SELECT COUNT(*)::int FROM impressions i WHERE i.campaign_id = c.id AND i.created_at::date = CURRENT_DATE) AS impressions_today,
          (SELECT COALESCE(SUM(i.winning_bid), 0) / 1000 FROM impressions i WHERE i.campaign_id = c.id AND i.created_at::date = CURRENT_DATE)::text AS spend_today,
          (SELECT COUNT(*)::int FROM impressions i WHERE i.campaign_id = c.id) AS impressions_total,
          (SELECT COUNT(*)::int FROM clicks ck INNER JOIN impressions i ON i.id = ck.impression_id WHERE i.campaign_id = c.id AND ck.created_at::date = CURRENT_DATE) AS clicks_today
        FROM campaigns c
        WHERE COALESCE(c.advertiser_email, c.contact_email) = ${email}
        ORDER BY c.created_at DESC
      `;
      const enriched = result.rows.map((row) => {
        const daily = row.daily_budget != null ? Number(row.daily_budget) : 0;
        const spend = Number(row.spend_today ?? 0);
        const rem = daily > 0 ? Math.max(0, daily - spend) : null;
        return { ...row, remaining_budget_today: rem };
      });
      return json(enriched);
    }

    if (!auth) return unauthorized();
    if (auth.role === "publisher") return forbidden();

    if (auth.role === "admin") {
      const result = await sql<CampaignRow>`
        SELECT
          c.*,
          (SELECT COUNT(*)::int FROM impressions i WHERE i.campaign_id = c.id AND i.created_at::date = CURRENT_DATE) AS impressions_today,
          (SELECT COALESCE(SUM(i.winning_bid), 0) / 1000 FROM impressions i WHERE i.campaign_id = c.id AND i.created_at::date = CURRENT_DATE)::text AS spend_today,
          (SELECT COUNT(*)::int FROM creatives cr WHERE cr.campaign_id = c.id AND cr.status <> 'archived') AS creative_count
        FROM campaigns c
        ORDER BY c.created_at DESC
      `;
      const enriched = result.rows.map((row) => {
        const daily = row.daily_budget != null ? Number(row.daily_budget) : 0;
        const spend = Number(row.spend_today ?? 0);
        const rem = daily > 0 ? Math.max(0, daily - spend) : null;
        return { ...row, remaining_budget_today: rem };
      });
      return json(enriched);
    }

    const adv = demandAdvertiserFilter(auth);
    if (!adv) {
      const result = await sql`SELECT * FROM campaigns ORDER BY created_at DESC`;
      return json(result.rows);
    }
    const result = await sql`
      SELECT * FROM campaigns
      WHERE COALESCE(advertiser_name, advertiser) = ${adv}
      ORDER BY created_at DESC
    `;
    return json(result.rows);
  } catch (e) {
    console.error("[campaigns GET]", e);
    return json({ error: "Failed to list campaigns" }, 500);
  }
}

export async function POST(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  const body = await request.json();

  const advertiserName = body.advertiser_name ?? body.advertiser;
  const campaignName = body.campaign_name ?? body.name;
  const advertiserEmail = body.advertiser_email ?? body.contact_email;

  if (!campaignName || !advertiserName || body.bid_price === undefined) {
    return badRequest("campaign_name, advertiser_name, and bid_price are required");
  }

  const bidNum = Number(body.bid_price);
  if (!Number.isFinite(bidNum) || bidNum < 0.1) {
    return badRequest("bid_price must be at least 0.10 USD CPM");
  }

  const budgetNum = body.daily_budget != null ? Number(body.daily_budget) : NaN;
  if (!Number.isFinite(budgetNum) || budgetNum < 5) {
    return badRequest("daily_budget must be at least 5 USD");
  }

  const targetSizes = Array.isArray(body.target_sizes) ? body.target_sizes : null;
  if (!targetSizes || targetSizes.length === 0) {
    return badRequest("target_sizes must include at least one size");
  }

  try {
    const startDate = body.start_date != null && body.start_date !== "" ? String(body.start_date) : null;
    const endDate = body.end_date != null && body.end_date !== "" ? String(body.end_date) : null;
    const geosRaw = Array.isArray(body.target_geos) ? body.target_geos : null;
    const geos =
      geosRaw && geosRaw.length > 0 && !(geosRaw.length === 1 && String(geosRaw[0]).toLowerCase() === "all")
        ? geosRaw
        : null;
    let envs = Array.isArray(body.target_environments) ? body.target_environments : null;
    let devices = Array.isArray(body.target_devices) ? body.target_devices : null;
    const domains = Array.isArray(body.target_domains) ? body.target_domains : null;

    if (!auth) {
      if (!envs || envs.length === 0) {
        return badRequest("target_environments must include at least one environment");
      }
      if (!devices || devices.length === 0) {
        return badRequest("target_devices must include at least one device type");
      }
      if (!advertiserEmail) return badRequest("advertiser_email is required for registration");
      const result = await sql`
        INSERT INTO campaigns (
          advertiser_name, advertiser_email, campaign_name, bid_price, daily_budget,
          target_sizes, target_geos, target_devices, target_environments, target_domains,
          start_date, end_date, status, name, advertiser, contact_email
        )
        VALUES (
          ${advertiserName}, ${advertiserEmail}, ${campaignName}, ${bidNum},
          ${budgetNum}, ${targetSizes}, ${geos}, ${devices}, ${envs}, ${domains},
          ${startDate}::date, ${endDate}::date, 'pending',
          ${campaignName}, ${advertiserName}, ${advertiserEmail}
        )
        RETURNING *
      `;
      return json(result.rows[0], 201);
    }

    if (auth.role === "publisher") return forbidden();

    const adv = demandAdvertiserFilter(auth);
    if (auth.role === "demand" && adv && advertiserName !== adv) {
      return forbidden("Advertiser must match your demand seat configuration");
    }

    const result = await sql`
      INSERT INTO campaigns (
        advertiser_name, advertiser_email, campaign_name, bid_price, daily_budget,
        target_sizes, target_geos, target_devices, target_environments, target_domains,
        start_date, end_date, status, name, advertiser, contact_email
      )
      VALUES (
        ${advertiserName}, ${advertiserEmail ?? null}, ${campaignName}, ${bidNum},
        ${budgetNum}, ${targetSizes}, ${geos}, ${devices}, ${envs}, ${domains},
        ${startDate}::date, ${endDate}::date, ${body.status ?? "active"},
        ${campaignName}, ${advertiserName}, ${advertiserEmail ?? null}
      )
      RETURNING *
    `;
    return json(result.rows[0], 201);
  } catch (e) {
    console.error("[campaigns POST]", e);
    return json({ error: "Failed to create campaign" }, 500);
  }
}
