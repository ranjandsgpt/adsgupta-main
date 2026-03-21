import { NextResponse } from "next/server";
import { getUser } from "../../../../lib/auth.js";
import { isPostgresConfigured } from "../../../../lib/cms-runtime.js";
import * as cms from "../../../../lib/cms-pg.js";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isPostgresConfigured()) return NextResponse.json({ slots: [] });
  try {
    const slots = await cms.listAdSlots();
    return NextResponse.json({ slots });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}

export async function POST(request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isPostgresConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  try {
    const body = await request.json();
    const id = await cms.insertAdSlot({
      name: body.name,
      placement: body.placement || "inline",
      ad_code: body.ad_code || "",
      active: body.active !== false,
    });
    return NextResponse.json({ id });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}
