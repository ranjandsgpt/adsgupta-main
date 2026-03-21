import { NextResponse } from "next/server";
import { getUser } from "../../../lib/auth.js";
import { isSupabaseCmsEnabled } from "../../../lib/cms-runtime.js";
import { createServerSupabase } from "../../../lib/supabase-server.js";
import * as cms from "../../../lib/supabase-cms.js";

/**
 * Called after publish. Subdomain sites read the same Supabase rows with
 * publish_to_ranjan / publish_to_pousali — this route validates auth and can
 * enqueue social/cross-post work later.
 */
export async function POST(request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let postId = null;
  try {
    const body = await request.json();
    postId = body.postId;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!postId) return NextResponse.json({ error: "postId required" }, { status: 400 });

  if (!isSupabaseCmsEnabled()) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    const supabase = createServerSupabase();
    const post = await cms.getPostById(supabase, user.id, postId);
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      ok: true,
      slug: post.slug,
      publish_to_ranjan: post.publish_to_ranjan,
      publish_to_pousali: post.publish_to_pousali,
    });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Sync failed" }, { status: 500 });
  }
}
