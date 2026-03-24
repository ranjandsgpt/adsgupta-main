export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { badRequest, json } from "@/lib/http";
import { NextRequest } from "next/server";

export async function GET() {
  const result = await sql`SELECT * FROM campaigns ORDER BY created_at DESC`;
  return json(result.rows);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.name || !body.advertiser || body.bid_price === undefined) return badRequest("name, advertiser, bid_price are required");
  const result = await sql`
    INSERT INTO campaigns
    (name, advertiser, budget, daily_budget, bid_price, target_sizes, target_geos, target_devices, status, start_date, end_date)
    VALUES
    (${body.name}, ${body.advertiser}, ${body.budget ?? null}, ${body.daily_budget ?? null}, ${body.bid_price}, ${body.target_sizes ?? null}, ${body.target_geos ?? null}, ${body.target_devices ?? null}, ${body.status ?? "active"}, ${body.start_date ?? null}, ${body.end_date ?? null})
    RETURNING *
  `;
  return json(result.rows[0], 201);
}
