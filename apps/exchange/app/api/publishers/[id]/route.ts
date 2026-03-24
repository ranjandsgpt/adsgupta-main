export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role === "publisher" && auth.publisherId !== params.id) return forbidden();

  const result = await sql`SELECT * FROM publishers WHERE id = ${params.id} LIMIT 1`;
  return json(result.rows[0] ?? null);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role !== "admin" && !(auth.role === "publisher" && auth.publisherId === params.id)) {
    return forbidden();
  }

  const body = await request.json();
  const result = await sql`
    UPDATE publishers SET
      name = COALESCE(${body.name ?? null}, name),
      domain = COALESCE(${body.domain ?? null}, domain),
      contact_email = COALESCE(${body.contact_email ?? null}, contact_email),
      ads_txt_verified = COALESCE(${body.ads_txt_verified ?? null}, ads_txt_verified),
      status = COALESCE(${body.status ?? null}, status)
    WHERE id = ${params.id}
    RETURNING *
  `;
  return json(result.rows[0] ?? null);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role !== "admin") return forbidden("Only admins can delete publishers");

  await sql`DELETE FROM publishers WHERE id = ${params.id}`;
  return json({ ok: true });
}
