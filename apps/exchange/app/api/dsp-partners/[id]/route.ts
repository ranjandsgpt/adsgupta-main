export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request);
  if (!auth || auth.role !== "admin") return auth ? forbidden() : unauthorized();
  const body = await request.json();
  if (body.auth_credentials !== undefined) {
    const r = await sql`
      UPDATE dsp_partners SET
        name = COALESCE(${body.name ?? null}, name),
        endpoint_url = COALESCE(${body.endpoint_url ?? null}, endpoint_url),
        timeout_ms = COALESCE(${body.timeout_ms ?? null}, timeout_ms),
        status = COALESCE(${body.status ?? null}, status),
        auth_credentials = ${JSON.stringify(body.auth_credentials)}::jsonb
      WHERE id = ${params.id}::uuid
      RETURNING *
    `;
    return NextResponse.json(r.rows[0] ?? null);
  }
  const r = await sql`
    UPDATE dsp_partners SET
      name = COALESCE(${body.name ?? null}, name),
      endpoint_url = COALESCE(${body.endpoint_url ?? null}, endpoint_url),
      timeout_ms = COALESCE(${body.timeout_ms ?? null}, timeout_ms),
      status = COALESCE(${body.status ?? null}, status)
    WHERE id = ${params.id}::uuid
    RETURNING *
  `;
  return NextResponse.json(r.rows[0] ?? null);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request);
  if (!auth || auth.role !== "admin") return auth ? forbidden() : unauthorized();
  await sql`UPDATE dsp_partners SET status = 'inactive' WHERE id = ${params.id}::uuid`;
  return NextResponse.json({ ok: true });
}
