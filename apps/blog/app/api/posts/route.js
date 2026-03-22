import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth-options.js";
import { isPostgresConfigured } from "../../../lib/cms-runtime.js";
import * as cms from "../../../lib/cms-pg.js";
import { profileFromUser } from "../../../lib/auth.js";

/**
 * GET: authenticated → author’s posts (optional status, search, page).
 *       unauthenticated → public published list (subdomain=blog|ranjan|pousali or default blog feed).
 * POST: create post (auth required).
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const session = await getServerSession(authOptions);

  if (session?.user?.email) {
    if (!isPostgresConfigured()) {
      return NextResponse.json({ posts: [], page: 1, pageSize: 20 });
    }
    const status = searchParams.get("status") || "all";
    const q = searchParams.get("search") || searchParams.get("q") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10) || 20));

    try {
      const all = await cms.listPostsForAdmin(session.user.email, {
        status: status === "all" ? undefined : status,
        q,
      });
      const total = all.length;
      const start = (page - 1) * pageSize;
      const posts = all.slice(start, start + pageSize);
      return NextResponse.json({ posts, page, pageSize, total });
    } catch (e) {
      return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
    }
  }

  const subdomain = searchParams.get("subdomain") || "blog";
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10) || 50, 100);
  const offset = parseInt(searchParams.get("offset") || "0", 10) || 0;

  if (!isPostgresConfigured()) {
    return NextResponse.json({ posts: [] });
  }

  try {
    let rows;
    if (subdomain === "ranjan") {
      rows = await cms.listPostsBySubdomain("ranjan", { limit, offset });
    } else if (subdomain === "pousali") {
      rows = await cms.listPostsBySubdomain("pousali", { limit, offset });
    } else {
      rows = await cms.listPublishedBlogPosts({ limit, offset });
    }
    return NextResponse.json({ posts: rows || [] });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isPostgresConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  try {
    const body = await request.json();
    const profile = profileFromUser({
      email: session.user.email,
      name: session.user.name,
      subdomain: session.user.subdomain,
    });
    const subdomain = profile?.subdomain || "ranjan";
    const id = await cms.createPost(session.user.email, body, subdomain, session.user.name);
    return NextResponse.json({ id });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Failed to create post" }, { status: 500 });
  }
}
