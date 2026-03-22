import { NextResponse } from "next/server";
import { isPostgresConfigured } from "../../../lib/cms-runtime.js";
import * as cms from "../../../lib/cms-pg.js";

/** Public: active monetization slots for embedding on the blog (no auth). */
export async function GET() {
  if (!isPostgresConfigured()) {
    return NextResponse.json({ slots: [] });
  }
  try {
    const all = await cms.listAdSlots();
    const slots = (all || []).filter((s) => s.active);
    return NextResponse.json({ slots });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}
