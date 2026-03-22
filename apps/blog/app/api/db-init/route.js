import { NextResponse } from "next/server";
import { createTables } from "../../../lib/db-init.js";

function extractSecret(request) {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7).trim();
  }
  const h = request.headers.get("x-db-init-secret");
  if (h) return h.trim();
  return request.nextUrl.searchParams.get("secret");
}

export async function GET(request) {
  const secret = extractSecret(request);
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
