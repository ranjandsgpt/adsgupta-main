import { NextResponse } from "next/server";
import { getUser } from "../../../../lib/auth.js";
import { isSupabaseCmsEnabled } from "../../../../lib/cms-runtime.js";
import { createServerSupabase } from "../../../../lib/supabase-server.js";
import * as cms from "../../../../lib/supabase-cms.js";
import { getAllPostsForAdmin, createPost } from "../../../../lib/db.js";

async function requireAdmin() {
  const user = await getUser();
  if (!user) return null;
  return user;
}

export async function GET(request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "all";
  const q = searchParams.get("q") || "";

  if (isSupabaseCmsEnabled()) {
    try {
      const supabase = createServerSupabase();
      const posts = await cms.listPostsForAdmin(supabase, user.id, {
        status: status === "all" ? undefined : status,
        q,
      });
      return NextResponse.json(posts);
    } catch (e) {
      return NextResponse.json({ error: e.message || "Failed to list posts" }, { status: 500 });
    }
  }

  const filters = {};
  if (status && status !== "all") filters.status = status;
  let posts = getAllPostsForAdmin(filters);
  if (q.trim()) {
    const t = q.trim().toLowerCase();
    posts = posts.filter(
      (p) =>
        (p.title || "").toLowerCase().includes(t) || (p.slug || "").toLowerCase().includes(t)
    );
  }
  return NextResponse.json(posts);
}

export async function POST(request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    if (isSupabaseCmsEnabled()) {
      const supabase = createServerSupabase();
      const profile = await cms.getProfile(supabase, user.id);
      const id = await cms.createPost(supabase, user.id, body, profile);
      return NextResponse.json({ id });
    }
    const id = createPost({
      title: body.title,
      slug: body.slug,
      content: body.content,
      excerpt: body.excerpt,
      source: body.source,
      category: body.category,
      external_url: body.external_url,
      publish_date: body.publish_date,
      status: body.status || "draft",
    });
    return NextResponse.json({ id });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Failed to create post" }, { status: 500 });
  }
}
