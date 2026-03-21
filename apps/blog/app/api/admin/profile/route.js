import { NextResponse } from "next/server";
import { getUser } from "../../../../lib/auth.js";
import { isSupabaseCmsEnabled } from "../../../../lib/cms-runtime.js";
import { createServerSupabase } from "../../../../lib/supabase-server.js";
import * as cms from "../../../../lib/supabase-cms.js";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSupabaseCmsEnabled()) {
    return NextResponse.json({
      subdomain: null,
      linkedin_token: null,
      instagram_token: null,
      facebook_token: null,
      twitter_token: null,
    });
  }
  try {
    const supabase = createServerSupabase();
    const profile = await cms.getProfile(supabase, user.id);
    return NextResponse.json({
      subdomain: profile?.subdomain ?? null,
      linkedin_token: profile?.linkedin_token ?? null,
      instagram_token: profile?.instagram_token ?? null,
      facebook_token: profile?.facebook_token ?? null,
      twitter_token: profile?.twitter_token ?? null,
      full_name: profile?.full_name ?? null,
      username: profile?.username ?? null,
    });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}
