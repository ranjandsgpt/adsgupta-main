import { NextResponse } from "next/server";
import { getUser } from "../../../../lib/auth.js";
import { isSupabaseCmsEnabled } from "../../../../lib/cms-runtime.js";
import { createServerSupabase } from "../../../../lib/supabase-server.js";
import * as cms from "../../../../lib/supabase-cms.js";

export async function GET(request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSupabaseCmsEnabled()) return NextResponse.json({ subscribers: [] });

  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("status");
  const status = raw && raw !== "all" ? raw : undefined;

  try {
    const supabase = createServerSupabase();
    const subscribers = await cms.listSubscribers(supabase, { status });
    return NextResponse.json({ subscribers });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
