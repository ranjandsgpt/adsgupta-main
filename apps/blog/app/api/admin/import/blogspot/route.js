import { NextResponse } from "next/server";
import { getUser } from "../../../../../lib/auth.js";
import { isPostgresConfigured } from "../../../../../lib/cms-runtime.js";
import { runBlogspotImport } from "../../../../../lib/blogspot-import.js";

export async function POST(request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isPostgresConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const result = await runBlogspotImport(user, body);
    return NextResponse.json(result.body, { status: result.ok ? 200 : result.status || 500 });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Import failed" }, { status: 500 });
  }
}
