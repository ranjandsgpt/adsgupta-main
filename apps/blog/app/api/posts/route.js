import { NextResponse } from "next/server";
import { isSupabaseCmsEnabled } from "../../../lib/cms-runtime.js";
import { createServerSupabase } from "../../../lib/supabase-server.js";
import * as cms from "../../../lib/supabase-cms.js";

/**
 * Public posts feed for main blog and subdomain surfaces.
 * ?subdomain=ranjan | pousali filters by publish flags (requires RLS policies in Supabase).
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const subdomain = (searchParams.get("subdomain") || "").toLowerCase();
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "30", 10) || 30));
  const offset = Math.max(0, parseInt(searchParams.get("offset") || "0", 10) || 0);

  if (!isSupabaseCmsEnabled()) {
    return NextResponse.json({ posts: [], source: "none" });
  }

  try {
    const supabase = createServerSupabase();
    let rows;
    if (subdomain === "ranjan" || subdomain === "pousali") {
      rows = await cms.listPostsBySubdomain(supabase, subdomain, { limit, offset });
    } else {
      rows = await cms.listPublishedBlogPosts(supabase, { limit, offset });
    }
    const posts = (rows || []).map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      subtitle: r.subtitle,
      excerpt: r.excerpt,
      cover_image: r.cover_image,
      category: r.category,
      published_at: r.published_at,
      featured: r.featured,
      read_time_minutes: r.read_time_minutes,
    }));
    return NextResponse.json({ posts, subdomain: subdomain || "blog" });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Failed to load posts" }, { status: 500 });
  }
}
