import { NextResponse } from "next/server";
import { isPostgresConfigured } from "../../../lib/cms-runtime.js";
import * as cms from "../../../lib/cms-pg.js";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  if (!isPostgresConfigured()) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    await cms.insertSubscriber(email, body.source || "footer");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Subscribe failed" }, { status: 500 });
  }
}
