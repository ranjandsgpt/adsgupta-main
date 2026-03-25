export const dynamic = "force-dynamic";
import { buildCampaignIntelligence } from "@/lib/campaign-intelligence";
import { demandAdvertiserFilter } from "@/lib/demand-scope";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { campaignId: string } }) {
  const auth = await getAuthFromRequest(request);
  const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase() ?? "";

  const full = await sql`SELECT * FROM campaigns WHERE id = ${params.campaignId} LIMIT 1`;
  const campaign = full.rows[0] as Record<string, unknown> | undefined;
  if (!campaign) return json({ error: "Campaign not found" }, 404);

  const campEm = String(campaign.advertiser_email ?? campaign.contact_email ?? "")
    .trim()
    .toLowerCase();

  if (!auth) {
    if (!email || email !== campEm) return unauthorized();
  } else if (auth.role === "admin") {
    /* ok */
  } else if (auth.role === "publisher") {
    return forbidden();
  } else if (auth.role === "demand") {
    const adv = demandAdvertiserFilter(auth);
    const advName = String(campaign.advertiser_name ?? campaign.advertiser ?? "");
    if (adv && advName !== adv) return forbidden();
  } else {
    return forbidden();
  }

  const payload = await buildCampaignIntelligence(params.campaignId);
  if (!payload) return json({ error: "Campaign not found" }, 404);
  return json(payload);
}
