export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const pub = await sql<{ id: string; name: string; domain: string }>`
    SELECT id, name, domain FROM publishers WHERE status = 'active' ORDER BY name
  `;

  const sellers = pub.rows.map((p) => ({
    seller_id: p.id,
    name: p.name,
    domain: p.domain,
    seller_type: "PUBLISHER",
    is_confidential: 0
  }));

  const body = {
    contact_email: "ranjan@adsgupta.com",
    contact_address: "exchange.adsgupta.com",
    version: "1.0",
    sellers
  };

  return NextResponse.json(body, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600"
    }
  });
}
