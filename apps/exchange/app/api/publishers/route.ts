export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { badRequest, json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();

  if (auth.role === "admin") {
    const result = await sql`SELECT * FROM publishers ORDER BY created_at DESC`;
    return json(result.rows);
  }

  if (auth.role === "publisher") {
    if (!auth.publisherId) return json([]);
    const result = await sql`SELECT * FROM publishers WHERE id = ${auth.publisherId} ORDER BY created_at DESC`;
    return json(result.rows);
  }

  return forbidden();
}

export async function POST(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  const body = await request.json();

  if (!body.name || !body.domain) return badRequest("name and domain are required");

  /** Self-registration (no auth): always pending */
  if (!auth) {
    const result = await sql`
      INSERT INTO publishers (name, domain, contact_email, ads_txt_verified, status)
      VALUES (${body.name}, ${body.domain}, ${body.contact_email ?? null}, false, 'pending')
      RETURNING *
    `;
    return json(result.rows[0], 201);
  }

  if (auth.role !== "admin") return forbidden("Only exchange admins can create publishers here");

  const result = await sql`
    INSERT INTO publishers (name, domain, contact_email, ads_txt_verified, status)
    VALUES (${body.name}, ${body.domain}, ${body.contact_email ?? null}, ${Boolean(body.ads_txt_verified)}, ${body.status ?? "active"})
    RETURNING *
  `;
  return json(result.rows[0], 201);
}
