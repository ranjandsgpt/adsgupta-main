export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role !== "admin") return forbidden();

  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") ?? "100"), 500);
  const result = await sql`
    SELECT * FROM auction_log
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return NextResponse.json(result.rows);
}
