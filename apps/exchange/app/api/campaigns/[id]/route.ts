export const dynamic = "force-dynamic";
import { demandAdvertiserFilter } from "@/lib/demand-scope";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

async function loadCampaign(id: string) {
  const result = await sql`SELECT * FROM campaigns WHERE id = ${id} LIMIT 1`;
  return result.rows[0] as Record<string, unknown> | null;
}

function canDemandAccessCampaign(
  auth: Awaited<ReturnType<typeof getAuthFromRequest>>,
  campaign: Record<string, unknown> | null
): boolean {
  if (!auth || !campaign) return false;
  if (auth.role !== "demand") return true;
  const adv = demandAdvertiserFilter(auth);
  if (!adv) return true;
  return campaign.advertiser === adv;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request);
  const campaign = await loadCampaign(params.id);
  if (!campaign) return json(null);

  if (!auth) {
    return json(campaign);
  }

  if (auth.role === "publisher") return forbidden();
  if (!canDemandAccessCampaign(auth, campaign)) return forbidden();
  return json(campaign);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role === "publisher") return forbidden();

  const existing = await loadCampaign(params.id);
  if (!existing) return json(null);
  if (!canDemandAccessCampaign(auth, existing)) return forbidden();

  const body = await request.json();
  const adv = demandAdvertiserFilter(auth);
  if (auth.role === "demand" && adv && body.advertiser !== undefined && body.advertiser !== adv) {
    return forbidden("Cannot reassign advertiser outside your seat");
  }

  const result = await sql`
    UPDATE campaigns SET
      name = COALESCE(${body.name ?? null}, name),
      advertiser = COALESCE(${body.advertiser ?? null}, advertiser),
      budget = COALESCE(${body.budget ?? null}, budget),
      daily_budget = COALESCE(${body.daily_budget ?? null}, daily_budget),
      bid_price = COALESCE(${body.bid_price ?? null}, bid_price),
      target_sizes = COALESCE(${body.target_sizes ?? null}, target_sizes),
      target_geos = COALESCE(${body.target_geos ?? null}, target_geos),
      target_devices = COALESCE(${body.target_devices ?? null}, target_devices),
      status = COALESCE(${body.status ?? null}, status),
      start_date = COALESCE(${body.start_date ?? null}, start_date),
      end_date = COALESCE(${body.end_date ?? null}, end_date),
      contact_email = COALESCE(${body.contact_email ?? null}, contact_email)
    WHERE id = ${params.id}
    RETURNING *
  `;
  return json(result.rows[0] ?? null);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role !== "admin") return forbidden("Only admins can activate campaigns");

  const body = await request.json();
  const result = await sql`
    UPDATE campaigns SET
      name = COALESCE(${body.name ?? null}, name),
      advertiser = COALESCE(${body.advertiser ?? null}, advertiser),
      budget = COALESCE(${body.budget ?? null}, budget),
      daily_budget = COALESCE(${body.daily_budget ?? null}, daily_budget),
      bid_price = COALESCE(${body.bid_price ?? null}, bid_price),
      target_sizes = COALESCE(${body.target_sizes ?? null}, target_sizes),
      target_geos = COALESCE(${body.target_geos ?? null}, target_geos),
      target_devices = COALESCE(${body.target_devices ?? null}, target_devices),
      status = COALESCE(${body.status ?? null}, status),
      start_date = COALESCE(${body.start_date ?? null}, start_date),
      end_date = COALESCE(${body.end_date ?? null}, end_date),
      contact_email = COALESCE(${body.contact_email ?? null}, contact_email)
    WHERE id = ${params.id}
    RETURNING *
  `;
  return json(result.rows[0] ?? null);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role === "publisher") return forbidden();

  const existing = await loadCampaign(params.id);
  if (!existing) return json({ ok: true });
  if (!canDemandAccessCampaign(auth, existing)) return forbidden();

  await sql`DELETE FROM campaigns WHERE id = ${params.id}`;
  return json({ ok: true });
}
