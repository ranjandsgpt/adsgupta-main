export const dynamic = "force-dynamic";
import { cacheClear } from "@/lib/cache";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role !== "admin") return forbidden();

  const result = await sql`SELECT * FROM pricing_rules ORDER BY created_at DESC`;
  return json(result.rows);
}

export async function POST(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role !== "admin") return forbidden();

  const body = await request.json();
  const result = await sql`
    INSERT INTO pricing_rules (name, floor_cpm, applies_to_sizes, applies_to_env, active, rule_type)
    VALUES (
      ${body.name},
      ${body.floor_cpm},
      ${body.applies_to_sizes ?? null},
      ${body.applies_to_env ?? null},
      ${body.active ?? true},
      ${body.rule_type ?? "unified"}
    )
    RETURNING *
  `;
  cacheClear("pricing:");
  return json(result.rows[0], 201);
}
