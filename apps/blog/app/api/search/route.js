import { NextResponse } from "next/server";
import { isPostgresConfigured } from "../../../lib/cms-runtime.js";
import * as cms from "../../../lib/cms-pg.js";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || searchParams.get("query") || "";

  if (isPostgresConfigured()) {
    try {
      const rows = await cms.searchPublishedPosts(q, { limit: 50 });
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

  return NextResponse.json([]);
}
