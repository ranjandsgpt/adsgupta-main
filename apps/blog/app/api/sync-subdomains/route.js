import { NextResponse } from "next/server";
import { getUser } from "../../../lib/auth.js";
import { isPostgresConfigured } from "../../../lib/cms-runtime.js";
import * as cms from "../../../lib/cms-pg.js";

/**
 * Called after publish. Subdomain sites read Postgres rows with
 * publish_to_ranjan / publish_to_pousali — logs stub social_sync rows for cross-post flags.
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

  if (!isPostgresConfigured()) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    const post = await cms.getPostById(user.email, postId);
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const platforms = [];
    if (post.crosspost_linkedin) platforms.push("linkedin");
    if (post.crosspost_twitter) platforms.push("twitter");
    if (post.crosspost_facebook) platforms.push("facebook");
    if (post.crosspost_instagram) platforms.push("instagram");

    const created = [];
    for (const platform of platforms) {
      const did = await cms.ensureSocialSyncStub(postId, platform);
      if (did) created.push(platform);
    }

    return NextResponse.json({
      ok: true,
      slug: post.slug,
      publish_to_ranjan: post.publish_to_ranjan,
      publish_to_pousali: post.publish_to_pousali,
      social_stubs_created: created,
      social_stubs: platforms,
    });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Sync failed" }, { status: 500 });
  }
}
