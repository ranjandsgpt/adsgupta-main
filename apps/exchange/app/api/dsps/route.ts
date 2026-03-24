export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role !== "admin") return forbidden();

  const r = await sql`
    SELECT id, name, endpoint_url,
      CASE WHEN auth_token IS NOT NULL AND auth_token <> '' THEN true ELSE false END AS has_auth_token,
      bid_timeout_ms, active, created_at
    FROM dsps ORDER BY name
  `;
  return json(r.rows);
}

export async function POST(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role !== "admin") return forbidden();

  const body = (await request.json()) as {
    name?: string;
    endpoint_url?: string;
    auth_token?: string | null;
    bid_timeout_ms?: number;
    active?: boolean;
  };
  if (!body.name?.trim() || !body.endpoint_url?.trim()) {
    return json({ error: "name and endpoint_url required" }, 400);
  }

  const ins = await sql`
    INSERT INTO dsps (name, endpoint_url, auth_token, bid_timeout_ms, active)
    VALUES (
      ${body.name.trim()},
      ${body.endpoint_url.trim()},
      ${body.auth_token ?? null},
      ${body.bid_timeout_ms ?? 150},
      ${body.active ?? true}
    )
    RETURNING id, name, endpoint_url, bid_timeout_ms, active, created_at
  `;
  return json(ins.rows[0], 201);
}
