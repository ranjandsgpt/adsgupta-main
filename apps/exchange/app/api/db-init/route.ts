export const dynamic = "force-dynamic";
import { createTables } from "@/lib/db-init";
import { sql } from "@/lib/db";
import { rateLimitResponse } from "@/lib/rate-limit-http";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const limited = rateLimitResponse(request, "get:db-init", 1, 60_000);
  if (limited) return limited;

  const secret = request.nextUrl.searchParams.get("secret");
  if (!secret || secret !== process.env.DB_INIT_SECRET) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tablesCreated = await createTables();
    const adminEmail = process.env.EXCHANGE_ADMIN_EMAIL?.trim().toLowerCase();
    if (adminEmail) {
      await sql`
        INSERT INTO platform_users (email, name, role, status, invited_by)
        VALUES (${adminEmail}, 'Exchange Admin', 'admin', 'active', 'env-seed')
        ON CONFLICT (email) DO NOTHING
      `;
    }
    return NextResponse.json({ ok: true, tablesCreated });
  } catch (e) {
    console.error("[db-init]", e);
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
