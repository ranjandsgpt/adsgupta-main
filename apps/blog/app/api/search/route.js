import { NextResponse } from "next/server";
import { searchPosts } from "../../../lib/db.js";
import { isSupabaseCmsEnabled } from "../../../lib/cms-runtime.js";
import { createServerSupabase } from "../../../lib/supabase-server.js";
import { searchPublishedPosts } from "../../../lib/supabase-cms.js";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || searchParams.get("query") || "";

  if (isSupabaseCmsEnabled()) {
    try {
      const supabase = createServerSupabase();
      const rows = await searchPublishedPosts(supabase, q, { limit: 50 });
      return NextResponse.json(
        rows.map((p) => ({
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          category: p.category,
          date: p.published_at,
        }))
      );
    } catch {
      /* fall through */
    }
  }

  try {
    const posts = searchPosts(q);
    return NextResponse.json(
      posts.map((p) => ({
        slug: p.slug,
        title: p.meta?.title || p.title,
        excerpt: p.excerpt,
        category: p.category,
        date: p.publish_date,
      }))
    );
  } catch (e) {
    return NextResponse.json({ error: e.message || "Search failed" }, { status: 500 });
  }
}
