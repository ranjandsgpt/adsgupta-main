export const dynamic = "force-dynamic";
import { buildSellersJsonBody } from "@/lib/sellers-json-body";
import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

/** Public IAB sellers.json at `/sellers.json` (also available at `/api/sellers.json`). */
export async function GET() {
  const pub = await sql<{ id: string; name: string; domain: string }>`
    SELECT id, name, domain FROM publishers WHERE status = 'active' ORDER BY created_at
  `;

  const body = buildSellersJsonBody(pub.rows);

  return NextResponse.json(body, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
