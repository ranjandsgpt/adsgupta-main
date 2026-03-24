export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

async function loadUnit(id: string) {
  const result = await sql`SELECT * FROM ad_units WHERE id = ${id} LIMIT 1`;
  return result.rows[0] ?? null;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  const unit = await loadUnit(params.id);
  if (!unit) return json(null);
  if (auth.role === "publisher" && unit.publisher_id !== auth.publisherId) return forbidden();
  if (auth.role === "demand") return forbidden();
  return json(unit);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  const unit = await loadUnit(params.id);
  if (!unit) return json(null);
  if (auth.role === "publisher" && unit.publisher_id !== auth.publisherId) return forbidden();
  if (auth.role === "demand") return forbidden();

  const body = await request.json();
  const result = await sql`
    UPDATE ad_units SET
      name = COALESCE(${body.name ?? null}, name),
      sizes = COALESCE(${body.sizes ?? null}, sizes),
      ad_type = COALESCE(${body.ad_type ?? null}, ad_type),
      environment = COALESCE(${body.environment ?? null}, environment),
      floor_price = COALESCE(${body.floor_price ?? null}, floor_price),
      status = COALESCE(${body.status ?? null}, status)
    WHERE id = ${params.id}
    RETURNING *
  `;
  return json(result.rows[0] ?? null);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  const unit = await loadUnit(params.id);
  if (!unit) return json({ ok: true });
  if (auth.role === "publisher" && unit.publisher_id !== auth.publisherId) return forbidden();
  if (auth.role === "demand") return forbidden();
  if (auth.role !== "admin" && auth.role !== "publisher") return forbidden();

  await sql`DELETE FROM ad_units WHERE id = ${params.id}`;
  return json({ ok: true });
}
