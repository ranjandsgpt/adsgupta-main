import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth-options.js";
import { isPostgresConfigured } from "../../../../lib/cms-runtime.js";
import * as cms from "../../../../lib/cms-pg.js";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isPostgresConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { ids, action } = body;
    if (!Array.isArray(ids) || !ids.length || !action) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    if (action === "delete") {
      const n = await cms.bulkDelete(session.user.email, ids);
      return NextResponse.json({ ok: true, count: n });
    }
    if (action === "publish") {
      const n = await cms.bulkSetStatus(session.user.email, ids, "published");
      return NextResponse.json({ ok: true, count: n });
    }
    if (action === "archive") {
      const n = await cms.bulkSetStatus(session.user.email, ids, "archived");
      return NextResponse.json({ ok: true, count: n });
    }
    if (action === "draft") {
      const n = await cms.bulkSetStatus(session.user.email, ids, "draft");
      return NextResponse.json({ ok: true, count: n });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Bulk failed" }, { status: 500 });
  }
}
