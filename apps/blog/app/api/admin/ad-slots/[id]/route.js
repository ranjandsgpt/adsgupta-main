import { NextResponse } from "next/server";
import { getUser } from "../../../../../lib/auth.js";
import { isSupabaseCmsEnabled } from "../../../../../lib/cms-runtime.js";
import { createServerSupabase } from "../../../../../lib/supabase-server.js";
import * as cms from "../../../../../lib/supabase-cms.js";

export async function PUT(request, { params }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSupabaseCmsEnabled()) return NextResponse.json({ error: "Supabase required" }, { status: 503 });
  try {
    const body = await request.json();
    const supabase = createServerSupabase();
    await cms.updateAdSlot(supabase, params.id, {
      name: body.name,
      placement: body.placement,
      ad_code: body.ad_code,
      active: body.active,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSupabaseCmsEnabled()) return NextResponse.json({ error: "Supabase required" }, { status: 503 });
  try {
    const supabase = createServerSupabase();
    await cms.deleteAdSlot(supabase, params.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
