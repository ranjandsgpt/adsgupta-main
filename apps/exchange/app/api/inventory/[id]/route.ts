export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { NextRequest } from "next/server";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const result = await sql`SELECT * FROM ad_units WHERE id = ${params.id} LIMIT 1`;
  return json(result.rows[0] ?? null);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await sql`DELETE FROM ad_units WHERE id = ${params.id}`;
  return json({ ok: true });
}
