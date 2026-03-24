export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { NextRequest } from "next/server";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const result = await sql`SELECT * FROM publishers WHERE id = ${params.id} LIMIT 1`;
  return json(result.rows[0] ?? null);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await sql`DELETE FROM publishers WHERE id = ${params.id}`;
  return json({ ok: true });
}
