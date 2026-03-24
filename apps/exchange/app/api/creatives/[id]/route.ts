export const dynamic = "force-dynamic";
import { demandAdvertiserFilter } from "@/lib/demand-scope";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

async function loadCreativeWithAdvertiser(id: string) {
  const result = await sql`
    SELECT cr.*, COALESCE(c.advertiser_name, c.advertiser) AS campaign_advertiser
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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role === "publisher") return forbidden();

  try {
    const row = await loadCreativeWithAdvertiser(params.id);
    if (!row) return json(null);
    if (!canDemandAccessCreative(auth, row)) return forbidden();
    const { campaign_advertiser: _omit, ...creative } = row;
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

  const row = await loadCreativeWithAdvertiser(params.id);
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
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role === "publisher") return forbidden();

  const row = await loadCreativeWithAdvertiser(params.id);
  if (!row) return json(null);
  if (auth.role === "demand" && !canDemandAccessCreative(auth, row)) return forbidden();
  if (auth.role !== "admin" && auth.role !== "demand") return forbidden();

  const body = await request.json();
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
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role === "publisher") return forbidden();

  const row = await loadCreativeWithAdvertiser(params.id);
  if (!row) return json({ ok: true });
  if (!canDemandAccessCreative(auth, row)) return forbidden();

  try {
    await sql`DELETE FROM creatives WHERE id = ${params.id}`;
    return json({ ok: true });
  } catch (e) {
    console.error("[creative DELETE]", e);
    return json({ error: "Delete failed" }, 500);
  }
}
