export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth || auth.role !== "admin") return auth ? forbidden() : unauthorized();
  await request.json();
  const r = await sql<{ c: string }>`SELECT COUNT(*)::text AS c FROM user_profiles`;
  return NextResponse.json({ user_count: Number(r.rows[0]?.c ?? 0) });
}
