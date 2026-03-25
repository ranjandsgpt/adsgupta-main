export const dynamic = "force-dynamic";
import { buildCampaignIntelligence } from "@/lib/campaign-intelligence";
import { cacheDelete } from "@/lib/cache";
import { demandAdvertiserFilter } from "@/lib/demand-scope";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request);
  const body = await request.json().catch(() => ({}));

  const full = await sql`SELECT * FROM campaigns WHERE id = ${params.id} LIMIT 1`;
  const campaign = full.rows[0] as Record<string, unknown> | undefined;
  if (!campaign) return json({ error: "Not found" }, 404);

  const campEm = String(campaign.advertiser_email ?? campaign.contact_email ?? "")
    .trim()
    .toLowerCase();

  if (!auth) {
    const em = String(body.advertiser_email ?? "").trim().toLowerCase();
    if (!em || em !== campEm) return unauthorized();
  } else if (auth.role === "publisher") {
    return forbidden();
  } else if (auth.role === "demand") {
    const adv = demandAdvertiserFilter(auth);
    const advName = String(campaign.advertiser_name ?? campaign.advertiser ?? "");
    if (adv && advName !== adv) return forbidden();
  } else if (auth.role !== "admin") {
    return forbidden();
  }

  const intel = await buildCampaignIntelligence(params.id);
  if (!intel) return json({ error: "Not found" }, 404);

  const oldBid = Number(campaign.bid_price);
  const newBid = intel.bidRecommendation.recommendedBid;

  await sql`
    INSERT INTO bid_history (campaign_id, old_bid, new_bid, reason)
    VALUES (${params.id}, ${oldBid}, ${newBid}, ${intel.bidRecommendation.reasoning})
  `;

  const upd = await sql`
    UPDATE campaigns SET bid_price = ${newBid} WHERE id = ${params.id} RETURNING *
  `;
  cacheDelete("campaigns:active");

  return json({
    campaign: upd.rows[0],
    applied: newBid,
    intelligence: intel
  });
}
