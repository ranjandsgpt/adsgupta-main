import { NextResponse } from "next/server";
import { isSupabaseCmsEnabled } from "../../../../lib/cms-runtime.js";
import { createServerSupabase } from "../../../../lib/supabase-server.js";

export async function POST(request) {
  try {
    const body = await request.json();
    const slug = body.slug?.trim();
    const event_type = body.event_type || "view";
    if (!slug) return NextResponse.json({ ok: false }, { status: 400 });

    if (!isSupabaseCmsEnabled()) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const supabase = createServerSupabase();
    let post_id = null;
    const { data: post } = await supabase.from("posts").select("id").eq("slug", slug).maybeSingle();
    if (post?.id) post_id = post.id;

    await supabase.from("analytics_events").insert({
      post_id,
      event_type,
      referrer: typeof body.referrer === "string" ? body.referrer : null,
      session_id: typeof body.session_id === "string" ? body.session_id : null,
      device: body.device || null,
      country: body.country || null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
