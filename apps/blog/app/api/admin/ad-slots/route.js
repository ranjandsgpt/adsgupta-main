import { NextResponse } from "next/server";
import { getUser } from "../../../../lib/auth.js";
import { isSupabaseCmsEnabled } from "../../../../lib/cms-runtime.js";
import { createServerSupabase } from "../../../../lib/supabase-server.js";
import * as cms from "../../../../lib/supabase-cms.js";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSupabaseCmsEnabled()) return NextResponse.json({ slots: [] });
  try {
    const supabase = createServerSupabase();
    const slots = await cms.listAdSlots(supabase);
    return NextResponse.json({ slots });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSupabaseCmsEnabled()) return NextResponse.json({ error: "Supabase required" }, { status: 503 });
  try {
    const body = await request.json();
    const supabase = createServerSupabase();
    const id = await cms.insertAdSlot(supabase, {
      name: body.name || "Slot",
      placement: body.placement || "inline",
      ad_code: body.ad_code || "",
      active: body.active !== false,
    });
    return NextResponse.json({ id });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
