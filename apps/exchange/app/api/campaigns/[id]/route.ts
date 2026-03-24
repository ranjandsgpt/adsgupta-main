export const dynamic = "force-dynamic";
import { cacheDelete } from "@/lib/cache";
import { sendDemandActivationEmail } from "@/lib/email";
import { demandAdvertiserFilter } from "@/lib/demand-scope";
import { sql } from "@/lib/db";
import { badRequest, json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

async function loadCampaign(id: string) {
  try {
    const result = await sql`SELECT * FROM campaigns WHERE id = ${id} LIMIT 1`;
    return result.rows[0] as Record<string, unknown> | null;
  } catch (e) {
    console.error("[campaign load]", e);
    return null;
  }
}

function advertiserKey(campaign: Record<string, unknown> | null): string {
  if (!campaign) return "";
  return String(campaign.advertiser_name ?? campaign.advertiser ?? "");
}

function canDemandAccessCampaign(
  auth: Awaited<ReturnType<typeof getAuthFromRequest>>,
  campaign: Record<string, unknown> | null
): boolean {
  if (!auth || !campaign) return false;
  if (auth.role !== "demand") return true;
  const adv = demandAdvertiserFilter(auth);
  if (!adv) return true;
  return advertiserKey(campaign) === adv;
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
  const nextAdv = body.advertiser_name ?? body.advertiser;
  if (auth.role === "demand" && adv && nextAdv !== undefined && nextAdv !== adv) {
    return forbidden("Cannot reassign advertiser outside your seat");
  }

  try {
    const result = await sql`
      UPDATE campaigns SET
        campaign_name = COALESCE(${body.campaign_name ?? body.name ?? null}, campaign_name),
        advertiser_name = COALESCE(${body.advertiser_name ?? body.advertiser ?? null}, advertiser_name),
        advertiser_email = COALESCE(${body.advertiser_email ?? body.contact_email ?? null}, advertiser_email),
        name = COALESCE(${body.campaign_name ?? body.name ?? null}, name),
        advertiser = COALESCE(${body.advertiser_name ?? body.advertiser ?? null}, advertiser),
        contact_email = COALESCE(${body.advertiser_email ?? body.contact_email ?? null}, contact_email),
        daily_budget = COALESCE(${body.daily_budget ?? null}, daily_budget),
        bid_price = COALESCE(${body.bid_price ?? null}, bid_price),
        target_sizes = COALESCE(${body.target_sizes ?? null}, target_sizes),
        status = COALESCE(${body.status ?? null}, status)
      WHERE id = ${params.id}
      RETURNING *
    `;
    cacheDelete("campaigns:active");
    return json(result.rows[0] ?? null);
  } catch (e) {
    console.error("[campaigns PUT]", e);
    return json({ error: "Update failed" }, 500);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const existing = await loadCampaign(params.id);
  if (!existing) return json(null);
  const body = await request.json();
  const auth = await getAuthFromRequest(request);

  /** Self-serve dashboard (no session): verify contact email matches campaign. */
  if (!auth) {
    const em = String(body.advertiser_email ?? "").trim().toLowerCase();
    const campEm = String(existing.advertiser_email ?? existing.contact_email ?? "")
      .trim()
      .toLowerCase();
    if (!em || em !== campEm) return unauthorized();

    if (body.bid_price != null && body.status != null) {
      return badRequest("Update only bid_price or status per request");
    }
    if (body.bid_price != null) {
      const bp = Number(body.bid_price);
      if (!Number.isFinite(bp) || bp < 0.1) {
        return badRequest("bid_price must be at least 0.10");
      }
      try {
        const result = await sql`
          UPDATE campaigns SET bid_price = ${bp} WHERE id = ${params.id} RETURNING *
        `;
        cacheDelete("campaigns:active");
        return json(result.rows[0] ?? null);
      } catch (e) {
        console.error("[campaigns PATCH public bid]", e);
        return json({ error: "Update failed" }, 500);
      }
    }
    if (body.status != null) {
      if (!["active", "paused"].includes(String(body.status))) {
        return badRequest("Only active or paused allowed from dashboard");
      }
      try {
        const result = await sql`
          UPDATE campaigns SET status = ${body.status} WHERE id = ${params.id} RETURNING *
        `;
        cacheDelete("campaigns:active");
        return json(result.rows[0] ?? null);
      } catch (e) {
        console.error("[campaigns PATCH public status]", e);
        return json({ error: "Update failed" }, 500);
      }
    }
    return badRequest("bid_price or status required");
  }

  if (auth.role === "admin") {
    const prevStatus = String(existing.status ?? "");
    const nextSt = body.status != null ? String(body.status) : null;
    const rejReason =
      nextSt === "rejected"
        ? (body.rejection_reason != null ? String(body.rejection_reason).slice(0, 2000) : null)
        : nextSt != null && nextSt !== "rejected"
          ? null
          : undefined;
    try {
      const result =
        rejReason !== undefined
          ? await sql`
            UPDATE campaigns SET
              campaign_name = COALESCE(${body.campaign_name ?? body.name ?? null}, campaign_name),
              advertiser_name = COALESCE(${body.advertiser_name ?? body.advertiser ?? null}, advertiser_name),
              advertiser_email = COALESCE(${body.advertiser_email ?? body.contact_email ?? null}, advertiser_email),
              name = COALESCE(${body.campaign_name ?? body.name ?? null}, name),
              advertiser = COALESCE(${body.advertiser_name ?? body.advertiser ?? null}, advertiser),
              contact_email = COALESCE(${body.advertiser_email ?? body.contact_email ?? null}, contact_email),
              daily_budget = COALESCE(${body.daily_budget ?? null}, daily_budget),
              bid_price = COALESCE(${body.bid_price ?? null}, bid_price),
              target_sizes = COALESCE(${body.target_sizes ?? null}, target_sizes),
              status = COALESCE(${body.status ?? null}, status),
              rejection_reason = ${rejReason}
            WHERE id = ${params.id}
            RETURNING *
          `
          : await sql`
            UPDATE campaigns SET
              campaign_name = COALESCE(${body.campaign_name ?? body.name ?? null}, campaign_name),
              advertiser_name = COALESCE(${body.advertiser_name ?? body.advertiser ?? null}, advertiser_name),
              advertiser_email = COALESCE(${body.advertiser_email ?? body.contact_email ?? null}, advertiser_email),
              name = COALESCE(${body.campaign_name ?? body.name ?? null}, name),
              advertiser = COALESCE(${body.advertiser_name ?? body.advertiser ?? null}, advertiser),
              contact_email = COALESCE(${body.advertiser_email ?? body.contact_email ?? null}, contact_email),
              daily_budget = COALESCE(${body.daily_budget ?? null}, daily_budget),
              bid_price = COALESCE(${body.bid_price ?? null}, bid_price),
              target_sizes = COALESCE(${body.target_sizes ?? null}, target_sizes),
              status = COALESCE(${body.status ?? null}, status)
            WHERE id = ${params.id}
            RETURNING *
          `;
      const row = result.rows[0] as Record<string, unknown> | undefined;
      if (row && prevStatus !== "active" && String(row.status ?? "") === "active") {
        const em = String(row.advertiser_email ?? row.contact_email ?? "");
        const cn = String(row.campaign_name ?? row.name ?? "Campaign");
        if (em) void sendDemandActivationEmail(em, cn, params.id);
      }
      cacheDelete("campaigns:active");
      return json(row ?? null);
    } catch (e) {
      console.error("[campaigns PATCH admin]", e);
      return json({ error: "Update failed" }, 500);
    }
  }

  if (auth.role === "demand" && canDemandAccessCampaign(auth, existing)) {
    if (body.status == null) return badRequest("status required");
    if (!["active", "paused", "pending"].includes(body.status)) {
      return badRequest("Invalid status");
    }
    const prevStatus = String(existing.status ?? "");
    try {
      const result = await sql`
        UPDATE campaigns SET status = ${body.status} WHERE id = ${params.id} RETURNING *
      `;
      const row = result.rows[0] as Record<string, unknown> | undefined;
      if (row && prevStatus !== "active" && String(row.status ?? "") === "active") {
        const em = String(row.advertiser_email ?? row.contact_email ?? "");
        const cn = String(row.campaign_name ?? row.name ?? "Campaign");
        if (em) void sendDemandActivationEmail(em, cn, params.id);
      }
      cacheDelete("campaigns:active");
      return json(row ?? null);
    } catch (e) {
      console.error("[campaigns PATCH demand]", e);
      return json({ error: "Update failed" }, 500);
    }
  }

  return forbidden();
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role === "publisher") return forbidden();

  const existing = await loadCampaign(params.id);
  if (!existing) return json({ ok: true });
  if (!canDemandAccessCampaign(auth, existing)) return forbidden();

  try {
    await sql`DELETE FROM campaigns WHERE id = ${params.id}`;
    cacheDelete("campaigns:active");
    return json({ ok: true });
  } catch (e) {
    console.error("[campaigns DELETE]", e);
    return json({ error: "Delete failed" }, 500);
  }
}
