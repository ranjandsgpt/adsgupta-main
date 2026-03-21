import { NextResponse } from "next/server";
import { getUser } from "../../../../../lib/auth.js";
import { isPostgresConfigured } from "../../../../../lib/cms-runtime.js";
import * as cms from "../../../../../lib/cms-pg.js";

export async function PUT(request, { params }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isPostgresConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  try {
    const body = await request.json();
    await cms.updateAdSlot(params.id, body);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isPostgresConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  try {
    await cms.deleteAdSlot(params.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}
