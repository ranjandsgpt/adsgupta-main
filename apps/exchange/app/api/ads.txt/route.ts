export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

/** Aggregated ads.txt for active publishers (exchange as authorized seller). */
export async function GET() {
  const pub = await sql<{ id: string }>`
    SELECT id FROM publishers WHERE status = 'active' ORDER BY created_at
  `;
  const lines = pub.rows.map((r) => `exchange.adsgupta.com, ${r.id}, DIRECT, ${r.id}`);
  const body = lines.length ? `${lines.join("\n")}\n` : "";

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=120, stale-while=revalidate=600"
    }
  });
}
