export const dynamic = "force-dynamic";
import { cacheDelete } from "@/lib/cache";
import { demandAdvertiserFilter } from "@/lib/demand-scope";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

async function loadCampaign(id: string) {
  const result = await sql`SELECT * FROM campaigns WHERE id = ${id} LIMIT 1`;
  return result.rows[0] as Record<string, unknown> | undefined;
}

function emailMatches(campaign: Record<string, unknown>, email: string): boolean {
  const em = email.trim().toLowerCase();
  const campEm = String(campaign.advertiser_email ?? campaign.contact_email ?? "")
    .trim()
    .toLowerCase();
  return Boolean(em && campEm && em === campEm);
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request);
  const body = await request.json().catch(() => ({}));
  const winnerId = typeof body.creative_id === "string" ? body.creative_id : typeof body.creativeId === "string" ? body.creativeId : "";

  if (!winnerId) return json({ error: "creative_id required" }, 400);

  const existing = await loadCampaign(params.id);
  if (!existing) return json({ error: "Not found" }, 404);

  if (!auth) {
    const em = String(body.advertiser_email ?? "");
    if (!emailMatches(existing, em)) return unauthorized();
  } else if (auth.role === "publisher") {
    return forbidden();
  } else if (auth.role === "demand") {
    const adv = demandAdvertiserFilter(auth);
    const name = String(existing.advertiser_name ?? existing.advertiser ?? "");
    if (adv && name !== adv) return forbidden();
  } else if (auth.role !== "admin") {
    return forbidden();
  }

  const cr = await sql`
    SELECT id FROM creatives WHERE id = ${winnerId} AND campaign_id = ${params.id} LIMIT 1
  `;
  if (!cr.rows[0]) return json({ error: "Creative not in campaign" }, 400);

  await sql`
    UPDATE creatives SET status = 'paused' WHERE campaign_id = ${params.id} AND id <> ${winnerId}
  `;
  await sql`UPDATE creatives SET status = 'active' WHERE id = ${winnerId}`;
  await sql`
    UPDATE campaigns SET
      ab_winner_creative_id = ${winnerId},
      ab_test_active = false
    WHERE id = ${params.id}
  `;

  cacheDelete("campaigns:active");
  const updated = await loadCampaign(params.id);
  return json({ ok: true, campaign: updated });
}
