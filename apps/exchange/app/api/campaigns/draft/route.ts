export const dynamic = "force-dynamic";
import { cacheDelete } from "@/lib/cache";
import { sql } from "@/lib/db";
import { badRequest, json } from "@/lib/http";
import { validateCpm, validateEmail } from "@/lib/validate";
import { NextRequest } from "next/server";

/**
 * Save an incomplete campaign as draft (self-serve, no session required when email matches payload).
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  const advertiserName = String(body.advertiser_name ?? body.advertiser ?? "").trim() || "Advertiser";
  const campaignName = String(body.campaign_name ?? body.name ?? "Draft campaign").trim() || "Draft campaign";
  const advertiserEmail = body.advertiser_email ?? body.contact_email;

  if (!advertiserEmail || !validateEmail(String(advertiserEmail))) {
    return badRequest("advertiser_email is required");
  }

  const bidNum = body.bid_price != null && body.bid_price !== "" ? Number(body.bid_price) : 0.5;
  if (!Number.isFinite(bidNum) || !validateCpm(bidNum)) {
    return badRequest("bid_price must be valid CPM when provided");
  }

  const budgetNum =
    body.daily_budget != null && body.daily_budget !== "" ? Number(body.daily_budget) : 10;
  if (!Number.isFinite(budgetNum) || budgetNum < 1) {
    return badRequest("daily_budget must be at least 1 when provided");
  }

  const targetSizes = Array.isArray(body.target_sizes) && body.target_sizes.length
    ? body.target_sizes
    : ["300x250"];
  const geos = Array.isArray(body.target_geos) ? body.target_geos : null;
  let envs = Array.isArray(body.target_environments) ? body.target_environments : ["web"];
  let devices = Array.isArray(body.target_devices) ? body.target_devices : ["desktop", "mobile"];
  const domains = Array.isArray(body.target_domains) ? body.target_domains : null;
  const startDate = body.start_date != null && body.start_date !== "" ? String(body.start_date) : null;
  const endDate = body.end_date != null && body.end_date !== "" ? String(body.end_date) : null;
  const freqDay = body.freq_cap_day != null ? Number(body.freq_cap_day) : 0;
  const freqSess = body.freq_cap_session != null ? Number(body.freq_cap_session) : 0;

  try {
    const result = await sql`
      INSERT INTO campaigns (
        advertiser_name, advertiser_email, campaign_name, bid_price, daily_budget,
        target_sizes, target_geos, target_devices, target_environments, target_domains,
        start_date, end_date, status, name, advertiser, contact_email,
        freq_cap_day, freq_cap_session
      )
      VALUES (
        ${advertiserName}, ${String(advertiserEmail)}, ${campaignName}, ${bidNum},
        ${budgetNum}, ${targetSizes}, ${geos}, ${devices}, ${envs}, ${domains},
        ${startDate}::date, ${endDate}::date, 'draft',
        ${campaignName}, ${advertiserName}, ${String(advertiserEmail)},
        ${Number.isFinite(freqDay) ? freqDay : 0},
        ${Number.isFinite(freqSess) ? freqSess : 0}
      )
      RETURNING *
    `;
    cacheDelete("campaigns:active");
    return json(result.rows[0], 201);
  } catch (e) {
    console.error("[campaigns draft]", e);
    return json({ error: "Failed to save draft" }, 500);
  }
}
