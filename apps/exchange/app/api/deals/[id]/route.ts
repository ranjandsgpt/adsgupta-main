export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(_request);
  if (!auth || auth.role !== "admin") return auth ? forbidden() : unauthorized();
  const r = await sql`SELECT * FROM deals WHERE id = ${params.id}::uuid LIMIT 1`;
  return NextResponse.json(r.rows[0] ?? null);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request);
  if (!auth || auth.role !== "admin") return auth ? forbidden() : unauthorized();
  const body = await request.json();
  const r = await sql`
    UPDATE deals SET
      name = COALESCE(${body.name ?? null}, name),
      status = COALESCE(${body.status ?? null}, status),
      floor_cpm = COALESCE(${body.floor_cpm ?? null}, floor_cpm),
      fixed_cpm = COALESCE(${body.fixed_cpm ?? null}, fixed_cpm)
    WHERE id = ${params.id}::uuid
    RETURNING *
  `;
  return NextResponse.json(r.rows[0] ?? null);
}

/** Soft-disable: set status inactive. */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request);
  if (!auth || auth.role !== "admin") return auth ? forbidden() : unauthorized();
  await sql`UPDATE deals SET status = 'inactive' WHERE id = ${params.id}::uuid`;
  return NextResponse.json({ ok: true });
}
