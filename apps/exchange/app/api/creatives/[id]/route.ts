export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { NextRequest } from "next/server";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const result = await sql`SELECT * FROM creatives WHERE id = ${params.id} LIMIT 1`;
  return json(result.rows[0] ?? null);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json();
  const result = await sql`
    UPDATE creatives SET
      name = COALESCE(${body.name ?? null}, name),
      type = COALESCE(${body.type ?? null}, type),
      size = COALESCE(${body.size ?? null}, size),
      click_url = COALESCE(${body.click_url ?? null}, click_url),
      image_url = COALESCE(${body.image_url ?? null}, image_url),
      html_snippet = COALESCE(${body.html_snippet ?? null}, html_snippet),
      vast_url = COALESCE(${body.vast_url ?? null}, vast_url),
      status = COALESCE(${body.status ?? null}, status)
    WHERE id = ${params.id}
    RETURNING *
  `;
  return json(result.rows[0] ?? null);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await sql`DELETE FROM creatives WHERE id = ${params.id}`;
  return json({ ok: true });
}
