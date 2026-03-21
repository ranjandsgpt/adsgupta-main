import { NextResponse } from "next/server";
import { createTables } from "../../../lib/db-init.js";

export async function GET(request) {
  const secret = request.headers.get("x-db-init-secret") || request.nextUrl.searchParams.get("secret");
  if (!process.env.DB_INIT_SECRET || secret !== process.env.DB_INIT_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    await createTables();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message || "init failed" }, { status: 500 });
  }
}
