export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role !== "admin") return forbidden();

  const { id } = await ctx.params;
  const body = (await request.json()) as {
    name?: string;
    endpoint_url?: string;
    auth_token?: string | null;
    bid_timeout_ms?: number;
    active?: boolean;
    clear_token?: boolean;
  };

  const cur = await sql<{ id: string }>`SELECT id FROM dsps WHERE id = ${id} LIMIT 1`;
  if (!cur.rows[0]) return json({ error: "Not found" }, 404);

  if (body.name != null) await sql`UPDATE dsps SET name = ${body.name} WHERE id = ${id}`;
  if (body.endpoint_url != null) await sql`UPDATE dsps SET endpoint_url = ${body.endpoint_url} WHERE id = ${id}`;
  if (body.bid_timeout_ms != null) {
    await sql`UPDATE dsps SET bid_timeout_ms = ${Math.max(50, Math.min(2000, Number(body.bid_timeout_ms)))} WHERE id = ${id}`;
  }
  if (body.active != null) await sql`UPDATE dsps SET active = ${body.active} WHERE id = ${id}`;
  if (body.auth_token !== undefined || body.clear_token) {
    const tok = body.clear_token ? null : body.auth_token ?? null;
    await sql`UPDATE dsps SET auth_token = ${tok} WHERE id = ${id}`;
  }

  const r = await sql`
    SELECT id, name, endpoint_url,
      CASE WHEN auth_token IS NOT NULL AND auth_token <> '' THEN true ELSE false END AS has_auth_token,
      bid_timeout_ms, active, created_at
    FROM dsps WHERE id = ${id} LIMIT 1
  `;
  return json(r.rows[0]);
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role !== "admin") return forbidden();

  const { id } = await ctx.params;
  await sql`DELETE FROM dsps WHERE id = ${id}`;
  return json({ ok: true });
}
