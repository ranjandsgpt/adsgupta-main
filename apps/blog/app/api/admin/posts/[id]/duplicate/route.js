import { NextResponse } from "next/server";
import { getUser } from "../../../../../../lib/auth.js";
import { isPostgresConfigured } from "../../../../../../lib/cms-runtime.js";
import * as cms from "../../../../../../lib/cms-pg.js";

export async function POST(request, { params }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = params.id;

  if (!isPostgresConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const subdomain = user.subdomain || "ranjan";
    const newId = await cms.duplicatePost(user.email, id, subdomain);
    if (!newId) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ id: newId });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Duplicate failed" }, { status: 500 });
  }
}
