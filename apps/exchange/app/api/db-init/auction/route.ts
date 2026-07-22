export const dynamic = "force-dynamic";
import { migrateAuctionLogColumns } from "@/lib/db-init";
import { rateLimitResponse } from "@/lib/rate-limit-http";
import { NextRequest, NextResponse } from "next/server";

/** Fast path: add only auction_log columns needed to serve ads (no full schema migration). */
export async function GET(request: NextRequest) {
  const limited = rateLimitResponse(request, "get:db-init-auction", 3, 60_000);
  if (limited) return limited;

  const secret = request.nextUrl.searchParams.get("secret");
  if (!secret || secret !== process.env.DB_INIT_SECRET) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await migrateAuctionLogColumns();
    return NextResponse.json({ ok: true, migrated: "auction_log_columns" });
  } catch (e) {
    console.error("[db-init/auction]", e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
