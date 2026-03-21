import { NextResponse } from "next/server";
import { isPostgresConfigured } from "../../../lib/cms-runtime.js";
import * as cms from "../../../lib/cms-pg.js";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const subdomain = searchParams.get("subdomain");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10) || 50, 100);
  const offset = parseInt(searchParams.get("offset") || "0", 10) || 0;

  if (!isPostgresConfigured()) {
    return NextResponse.json({ posts: [] });
  }

  try {
    let rows;
    if (subdomain && subdomain !== "blog") {
      rows = await cms.listPostsBySubdomain(subdomain, { limit, offset });
    } else {
      rows = await cms.listPublishedBlogPosts({ limit, offset });
    }
    return NextResponse.json({ posts: rows || [] });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}
