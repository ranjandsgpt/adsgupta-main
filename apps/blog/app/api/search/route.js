import { NextResponse } from "next/server";
import { searchPosts } from "../../../lib/db.js";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || searchParams.get("query") || "";
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
