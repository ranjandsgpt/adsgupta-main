export const dynamic = "force-dynamic";
import { demandAdvertiserFilter } from "@/lib/demand-scope";
import { sql } from "@/lib/db";
import { badRequest, json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { del } from "@vercel/blob";
import { NextRequest } from "next/server";

async function loadCreativeRow(id: string) {
  const result = await sql`
    SELECT cr.*,
      COALESCE(c.advertiser_name, c.advertiser) AS campaign_advertiser,
      COALESCE(c.advertiser_email, c.contact_email) AS campaign_contact_email
    FROM creatives cr
    JOIN campaigns c ON c.id = cr.campaign_id
    WHERE cr.id = ${id}
    LIMIT 1
  `;
  return result.rows[0] as Record<string, unknown> | null;
}

function canDemandAccessCreative(
  auth: Awaited<ReturnType<typeof getAuthFromRequest>>,
  row: Record<string, unknown> | null
): boolean {
  if (!auth || !row) return false;
  if (auth.role !== "demand") return true;
  const adv = demandAdvertiserFilter(auth);
  if (!adv) return true;
  return row.campaign_advertiser === adv;
}

function emailMatches(row: Record<string, unknown>, bodyEmail: string): boolean {
  const em = String(bodyEmail ?? "")
    .trim()
    .toLowerCase();
  const campEm = String(row.campaign_contact_email ?? "")
    .trim()
    .toLowerCase();
  return Boolean(em && campEm && em === campEm);
}

async function deleteBlobSafe(url: string | null | undefined) {
  if (!url || typeof url !== "string") return;
  try {
    await del(url);
  } catch (e) {
    console.warn("[creative] blob delete skipped/failed:", e);
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role === "publisher") return forbidden();

  try {
    const row = await loadCreativeRow(params.id);
    if (!row) return json(null);
    if (!canDemandAccessCreative(auth, row)) return forbidden();
    const { campaign_advertiser: _a, campaign_contact_email: _e, ...creative } = row;
    return json(creative);
  } catch (e) {
    console.error("[creative GET]", e);
    return json({ error: "Failed to load creative" }, 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role === "publisher") return forbidden();

  const row = await loadCreativeRow(params.id);
  if (!row) return json(null);
  if (!canDemandAccessCreative(auth, row)) return forbidden();

  const body = await request.json();
  try {
    const result = await sql`
      UPDATE creatives SET
        name = COALESCE(${body.name ?? null}, name),
        type = COALESCE(${body.type ?? null}, type),
        size = COALESCE(${body.size ?? null}, size),
        click_url = COALESCE(${body.click_url ?? null}, click_url),
        image_url = COALESCE(${body.image_url ?? null}, image_url),
        html_snippet = COALESCE(${body.html_snippet ?? null}, html_snippet),
        vast_url = COALESCE(${body.vast_url ?? null}, vast_url),
        status = COALESCE(${body.status ?? null}, status)
      WHERE id = ${params.id}
      RETURNING *
    `;
    return json(result.rows[0] ?? null);
  } catch (e) {
    console.error("[creative PUT]", e);
    return json({ error: "Update failed" }, 500);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const row = await loadCreativeRow(params.id);
  if (!row) return json(null);
  const body = await request.json();
  const auth = await getAuthFromRequest(request);

  if (!auth) {
    if (!emailMatches(row, String(body.advertiser_email ?? ""))) return unauthorized();
    if (String(row.status ?? "") === "archived") return badRequest("Creative is archived");

    const nextName = body.name !== undefined ? body.name : null;
    const nextClick = body.click_url !== undefined ? body.click_url : null;
    const nextStatus = body.status !== undefined ? body.status : null;

    if (nextStatus != null && !["active", "paused"].includes(String(nextStatus))) {
      return badRequest("status must be active or paused");
    }
    if (nextName == null && nextClick == null && nextStatus == null) {
      return badRequest("name, click_url, or status required");
    }

    try {
      const result = await sql`
        UPDATE creatives SET
          name = COALESCE(${nextName}, name),
          click_url = COALESCE(${nextClick}, click_url),
          status = COALESCE(${nextStatus}, status)
        WHERE id = ${params.id}
        RETURNING id, image_url, size, name, status, click_url
      `;
      return json(result.rows[0] ?? null);
    } catch (e) {
      console.error("[creative PATCH public]", e);
      return json({ error: "Update failed" }, 500);
    }
  }

  if (auth.role === "publisher") return forbidden();
  if (auth.role === "demand" && !canDemandAccessCreative(auth, row)) return forbidden();
  if (auth.role !== "admin" && auth.role !== "demand") return forbidden();

  try {
    const result = await sql`
      UPDATE creatives SET
        name = COALESCE(${body.name ?? null}, name),
        type = COALESCE(${body.type ?? null}, type),
        size = COALESCE(${body.size ?? null}, size),
        click_url = COALESCE(${body.click_url ?? null}, click_url),
        image_url = COALESCE(${body.image_url ?? null}, image_url),
        status = COALESCE(${body.status ?? null}, status)
      WHERE id = ${params.id}
      RETURNING *
    `;
    return json(result.rows[0] ?? null);
  } catch (e) {
    console.error("[creative PATCH]", e);
    return json({ error: "Update failed" }, 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const row0 = await loadCreativeRow(params.id);
  if (!row0) return json({ ok: true });

  let body: { advertiser_email?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const auth = await getAuthFromRequest(request);

  if (!auth) {
    if (!emailMatches(row0, String(body.advertiser_email ?? ""))) return unauthorized();
  } else {
    if (auth.role === "publisher") return forbidden();
    if (!canDemandAccessCreative(auth, row0)) return forbidden();
  }

  const imageUrl = row0.image_url as string | null | undefined;

  try {
    await deleteBlobSafe(imageUrl ?? null);
    await sql`
      UPDATE creatives SET status = 'archived' WHERE id = ${params.id}
    `;
  } catch (e) {
    console.error("[creative DELETE]", e);
    return json({ error: "Delete failed" }, 500);
  }
  return json({ ok: true });
}
