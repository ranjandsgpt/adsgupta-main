export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { badRequest, json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();

  if (auth.role === "admin") {
    const result = await sql`SELECT * FROM ad_units ORDER BY created_at DESC`;
    return json(result.rows);
  }

  if (auth.role === "publisher") {
    if (!auth.publisherId) return json([]);
    const result =
      await sql`SELECT * FROM ad_units WHERE publisher_id = ${auth.publisherId} ORDER BY created_at DESC`;
    return json(result.rows);
  }

  return forbidden();
}

export async function POST(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role !== "admin" && auth.role !== "publisher") return forbidden();

  const body = await request.json();
  if (!body.publisher_id || !body.name || !body.ad_type || !body.environment) {
    return badRequest("publisher_id, name, ad_type, environment are required");
  }
  if (auth.role === "publisher") {
    if (!auth.publisherId || body.publisher_id !== auth.publisherId) {
      return forbidden("Cannot create inventory for another publisher");
    }
  }

  const result = await sql`
    INSERT INTO ad_units (publisher_id, name, sizes, ad_type, environment, floor_price, status)
    VALUES (${body.publisher_id}, ${body.name}, ${body.sizes ?? ["300x250"]}, ${body.ad_type}, ${body.environment}, ${body.floor_price ?? 0.5}, ${body.status ?? "active"})
    RETURNING *
  `;
  return json(result.rows[0], 201);
}
