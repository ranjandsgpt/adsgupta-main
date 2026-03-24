export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { badRequest, json } from "@/lib/http";
import { NextRequest } from "next/server";

export async function GET() {
  const result = await sql`SELECT * FROM ad_units ORDER BY created_at DESC`;
  return json(result.rows);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.publisher_id || !body.name || !body.ad_type || !body.environment) return badRequest("publisher_id, name, ad_type, environment are required");
  const result = await sql`
    INSERT INTO ad_units (publisher_id, name, sizes, ad_type, environment, floor_price, status)
    VALUES (${body.publisher_id}, ${body.name}, ${body.sizes ?? ["300x250"]}, ${body.ad_type}, ${body.environment}, ${body.floor_price ?? 0.5}, ${body.status ?? "active"})
    RETURNING *
  `;
  return json(result.rows[0], 201);
}
