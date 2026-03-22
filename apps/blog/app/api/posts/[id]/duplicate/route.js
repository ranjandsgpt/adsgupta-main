import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth-options.js";
import { isPostgresConfigured } from "../../../../../lib/cms-runtime.js";
import * as cms from "../../../../../lib/cms-pg.js";

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isPostgresConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const subdomain = session.user.subdomain || "ranjan";
    const newId = await cms.duplicatePost(session.user.email, params.id, subdomain);
    if (!newId) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ id: newId });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Duplicate failed" }, { status: 500 });
  }
}
