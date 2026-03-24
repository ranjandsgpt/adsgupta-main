export const dynamic = "force-dynamic";
import { demandAdvertiserFilter } from "@/lib/demand-scope";
import { sql } from "@/lib/db";
import { badRequest, json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  const email = request.nextUrl.searchParams.get("email");

  try {
    if (!auth && email) {
      const result = await sql`
        SELECT * FROM campaigns
        WHERE COALESCE(advertiser_email, contact_email) = ${email}
        ORDER BY created_at DESC
      `;
      return json(result.rows);
    }

    if (!auth) return unauthorized();
    if (auth.role === "publisher") return forbidden();

    if (auth.role === "admin") {
      const result = await sql`SELECT * FROM campaigns ORDER BY created_at DESC`;
      return json(result.rows);
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

  try {
    if (!auth) {
      if (!advertiserEmail) return badRequest("advertiser_email is required for registration");
      const result = await sql`
        INSERT INTO campaigns
        (advertiser_name, advertiser_email, campaign_name, bid_price, daily_budget, target_sizes, status, name, advertiser, contact_email)
        VALUES
        (${advertiserName}, ${advertiserEmail}, ${campaignName}, ${body.bid_price},
          ${body.daily_budget ?? null}, ${body.target_sizes ?? null}, 'pending',
          ${campaignName}, ${advertiserName}, ${advertiserEmail})
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
      INSERT INTO campaigns
      (advertiser_name, advertiser_email, campaign_name, bid_price, daily_budget, target_sizes, status, name, advertiser, contact_email)
      VALUES
      (${advertiserName}, ${advertiserEmail ?? null}, ${campaignName}, ${body.bid_price},
        ${body.daily_budget ?? null}, ${body.target_sizes ?? null}, ${body.status ?? "active"},
        ${campaignName}, ${advertiserName}, ${advertiserEmail ?? null})
      RETURNING *
    `;
    return json(result.rows[0], 201);
  } catch (e) {
    console.error("[campaigns POST]", e);
    return json({ error: "Failed to create campaign" }, 500);
  }
}
