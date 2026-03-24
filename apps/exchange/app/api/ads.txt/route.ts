export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const pub = await sql<{ id: string }>`
    SELECT id FROM publishers WHERE status = 'active' ORDER BY id
  `;

  const lines = pub.rows.map((p) => `exchange.adsgupta.com, ${p.id}, DIRECT, ${p.id}`);
  const text = lines.join("\n") + (lines.length ? "\n" : "");

  return new NextResponse(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900"
    }
  });
}
