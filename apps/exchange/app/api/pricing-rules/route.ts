export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { NextRequest } from "next/server";

export async function GET() {
  const result = await sql`SELECT * FROM pricing_rules ORDER BY created_at DESC`;
  return json(result.rows);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await sql`
    INSERT INTO pricing_rules (name, floor_cpm, applies_to_sizes, applies_to_env, active)
    VALUES (${body.name}, ${body.floor_cpm}, ${body.applies_to_sizes ?? null}, ${body.applies_to_env ?? null}, ${body.active ?? true})
    RETURNING *
  `;
  return json(result.rows[0], 201);
}
