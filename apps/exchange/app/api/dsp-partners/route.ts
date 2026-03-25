export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth || auth.role !== "admin") return auth ? forbidden() : unauthorized();
  const r = await sql`SELECT * FROM dsp_partners ORDER BY created_at DESC LIMIT 200`;
  return NextResponse.json(r.rows);
}

export async function POST(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth || auth.role !== "admin") return auth ? forbidden() : unauthorized();
  const body = await request.json();
  const r = await sql`
    INSERT INTO dsp_partners (name, endpoint_url, timeout_ms, status, auth_credentials)
    VALUES (
      ${body.name},
      ${body.endpoint_url},
      ${body.timeout_ms ?? 150},
      ${body.status ?? "active"},
      ${JSON.stringify(body.auth_credentials ?? {})}::jsonb
    )
    RETURNING *
  `;
  return NextResponse.json(r.rows[0], { status: 201 });
}
