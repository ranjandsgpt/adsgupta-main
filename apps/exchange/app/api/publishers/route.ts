export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { badRequest, json } from "@/lib/http";
import { NextRequest } from "next/server";

export async function GET() {
  const result = await sql`SELECT * FROM publishers ORDER BY created_at DESC`;
  return json(result.rows);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.name || !body.domain) return badRequest("name and domain are required");
  const result = await sql`
    INSERT INTO publishers (name, domain, contact_email, ads_txt_verified, status)
    VALUES (${body.name}, ${body.domain}, ${body.contact_email ?? null}, ${Boolean(body.ads_txt_verified)}, ${body.status ?? "active"})
    RETURNING *
  `;
  return json(result.rows[0], 201);
}
