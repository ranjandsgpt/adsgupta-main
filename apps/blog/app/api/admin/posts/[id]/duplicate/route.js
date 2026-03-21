import { NextResponse } from "next/server";
import { getUser } from "../../../../../../lib/auth.js";
import { isSupabaseCmsEnabled } from "../../../../../../lib/cms-runtime.js";
import { createServerSupabase } from "../../../../../../lib/supabase-server.js";
import * as cms from "../../../../../../lib/supabase-cms.js";
import { getPostById, createPost } from "../../../../../../lib/db.js";

export async function POST(request, { params }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = params.id;

  if (isSupabaseCmsEnabled()) {
    try {
      const supabase = createServerSupabase();
      const newId = await cms.duplicatePost(supabase, user.id, id);
      if (!newId) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ id: newId });
    } catch (e) {
      return NextResponse.json({ error: e.message || "Duplicate failed" }, { status: 500 });
    }
  }

  const numeric = parseInt(id, 10);
  if (Number.isNaN(numeric)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const post = getPostById(numeric);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const newId = createPost({
    title: `${post.title} (copy)`,
    slug: `${post.slug}-copy-${Date.now().toString(36)}`.slice(0, 120),
    content: post.content,
    excerpt: post.excerpt,
    category: post.category,
    source: post.source,
    external_url: post.external_url,
    publish_date: post.publish_date,
    status: "draft",
  });
  return NextResponse.json({ id: newId });
}
