export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

/**
 * Supply chain object for MDE / OpenRTB `source.schain`.
 */
export async function GET(request: NextRequest) {
  const publisherId = request.nextUrl.searchParams.get("publisherId")?.trim() ?? "";

  if (!publisherId) {
    return NextResponse.json({ error: "publisherId required" }, { status: 400 });
  }

  const row = await sql<{ id: string }>`
    SELECT id FROM publishers WHERE id = ${publisherId} AND status = 'active' LIMIT 1
  `;
  if (!row.rows[0]) {
    return NextResponse.json({ error: "Publisher not found" }, { status: 404 });
  }

  const schain = {
    complete: 1,
    ver: "1.0",
    nodes: [{ asi: "exchange.adsgupta.com", sid: publisherId, hp: 1 }]
  };

  return NextResponse.json(schain);
}
