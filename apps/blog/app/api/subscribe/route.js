import { NextResponse } from "next/server";
import { isSupabaseCmsEnabled } from "../../../lib/cms-runtime.js";
import { createServerSupabase } from "../../../lib/supabase-server.js";
import * as cms from "../../../lib/supabase-cms.js";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    if (!isSupabaseCmsEnabled()) {
      return NextResponse.json({ ok: true, local: true });
    }

    const supabase = createServerSupabase();
    await cms.insertSubscriber(supabase, email, body.source || "footer");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Subscribe failed" }, { status: 500 });
  }
}
