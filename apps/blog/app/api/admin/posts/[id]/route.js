import { NextResponse } from "next/server";
import { getUser } from "../../../../../lib/auth.js";
import { isSupabaseCmsEnabled } from "../../../../../lib/cms-runtime.js";
import { createServerSupabase } from "../../../../../lib/supabase-server.js";
import * as cms from "../../../../../lib/supabase-cms.js";
import { getPostById, updatePost, deletePost } from "../../../../../lib/db.js";

async function requireAdmin() {
  const user = await getUser();
  if (!user) return null;
  return user;
}

export async function GET(request, { params }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = params.id;

  if (isSupabaseCmsEnabled()) {
    try {
      const supabase = createServerSupabase();
      const post = await cms.getPostById(supabase, user.id, id);
      if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(post);
    } catch (e) {
      return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
    }
  }

  const numeric = parseInt(id, 10);
  if (Number.isNaN(numeric)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const post = getPostById(numeric);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(request, { params }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = params.id;

  if (isSupabaseCmsEnabled()) {
    try {
      const supabase = createServerSupabase();
      const body = await request.json();
      const ok = await cms.updatePost(supabase, user.id, id, body);
      if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ success: true });
    } catch (e) {
      return NextResponse.json({ error: e.message || "Failed to update" }, { status: 500 });
    }
  }

  const numeric = parseInt(id, 10);
  if (Number.isNaN(numeric)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const body = await request.json();
    updatePost(numeric, {
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
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = params.id;

  if (isSupabaseCmsEnabled()) {
    try {
      const supabase = createServerSupabase();
      const ok = await cms.deletePost(supabase, user.id, id);
      if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ success: true });
    } catch (e) {
      return NextResponse.json({ error: e.message || "Failed to delete" }, { status: 500 });
    }
  }

  const numeric = parseInt(id, 10);
  if (Number.isNaN(numeric)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  deletePost(numeric);
  return NextResponse.json({ success: true });
}
