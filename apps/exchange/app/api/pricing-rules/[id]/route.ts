export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role !== "admin") return forbidden();

  const result = await sql`SELECT * FROM pricing_rules WHERE id = ${params.id} LIMIT 1`;
  return json(result.rows[0] ?? null);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role !== "admin") return forbidden();

  const body = await request.json();
  const result = await sql`
    UPDATE pricing_rules SET
      name = COALESCE(${body.name ?? null}, name),
      floor_cpm = COALESCE(${body.floor_cpm ?? null}, floor_cpm),
      applies_to_sizes = COALESCE(${body.applies_to_sizes ?? null}, applies_to_sizes),
      applies_to_env = COALESCE(${body.applies_to_env ?? null}, applies_to_env),
      active = COALESCE(${body.active ?? null}, active)
    WHERE id = ${params.id}
    RETURNING *
  `;
  return json(result.rows[0] ?? null);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role !== "admin") return forbidden();

  await sql`DELETE FROM pricing_rules WHERE id = ${params.id}`;
  return json({ ok: true });
}
