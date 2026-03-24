export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { NextRequest } from "next/server";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const result = await sql`SELECT * FROM campaigns WHERE id = ${params.id} LIMIT 1`;
  return json(result.rows[0] ?? null);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
      end_date = COALESCE(${body.end_date ?? null}, end_date)
    WHERE id = ${params.id}
    RETURNING *
  `;
  return json(result.rows[0] ?? null);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await sql`DELETE FROM campaigns WHERE id = ${params.id}`;
  return json({ ok: true });
}
