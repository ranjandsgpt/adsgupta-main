export const dynamic = "force-dynamic";
import { createTables } from "@/lib/db-init";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (!secret || secret !== process.env.DB_INIT_SECRET) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  await createTables();
  return NextResponse.json({ ok: true });
}
