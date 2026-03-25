export const dynamic = "force-dynamic";
import { buildAbResults } from "@/lib/campaign-ab-results";
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

/** When ab_auto_pause_loser is on and confidence > 95, pause losing variant(s). */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request);
  const body = await request.json().catch(() => ({}));

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

  if (!existing.ab_test_active) {
    return json({ ok: false, reason: "A/B test not active" });
  }
  if (!existing.ab_auto_pause_loser) {
    return json({ ok: false, reason: "Auto-pause disabled" });
  }

  const results = await buildAbResults(params.id);
  if (!results || results.confidence <= 95 || !results.winner) {
    return json({ ok: false, reason: "No significant winner yet" });
  }

  const loserIds = results.variants.filter((v) => v.creativeId !== results.winner).map((v) => v.creativeId);
  for (const lid of loserIds) {
    await sql`UPDATE creatives SET status = 'paused' WHERE id = ${lid} AND campaign_id = ${params.id}`;
  }

  cacheDelete("campaigns:active");
  return json({ ok: true, paused: loserIds });
}
