import { NextResponse } from "next/server";
import { getUser } from "../../../../lib/auth.js";
import { isPostgresConfigured } from "../../../../lib/cms-runtime.js";
import * as cms from "../../../../lib/cms-pg.js";

/** CSV download — admin only */
export async function GET(request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isPostgresConfigured()) {
    return new NextResponse("email,status,source,created_at\n", {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="subscribers.csv"',
      },
    });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;

  try {
    const rows = await cms.listSubscribers({ status });
    const header = "email,status,source,created_at\n";
    const body = (rows || [])
      .map((r) =>
        [r.email, r.status, (r.source || "").replace(/,/g, " "), r.created_at ? String(r.created_at) : ""].join(",")
      )
      .join("\n");
    return new NextResponse(header + body, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="subscribers.csv"',
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Export failed" }, { status: 500 });
  }
}
