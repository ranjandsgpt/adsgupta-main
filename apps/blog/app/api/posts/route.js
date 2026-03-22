import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth-options.js";
import { isPostgresConfigured } from "../../../lib/cms-runtime.js";
import * as cms from "../../../lib/cms-pg.js";
import { profileFromUser } from "../../../lib/auth.js";
import { serializePublicPost } from "../../../lib/public-post-serialize.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

/**
 * GET — Public (no auth): list or single post with CORS for ranjan.adsgupta.com etc.
 *       ?subdomain=ranjan|pousali|blog — list published posts for that surface
 *       ?slug= — single post (use ?subdomain=ranjan|pousali for ranjan/pousali flags)
 *       ?status=published — default for public lists
 * Authenticated: author post manager (unchanged).
 * POST: create post (auth).
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const session = await getServerSession(authOptions);

  const slugParam = searchParams.get("slug")?.trim();

  /** Public single-post fetch (ranjan blog-loader) — always unauthenticated semantics; CORS */
  if (slugParam) {
    if (!isPostgresConfigured()) {
      return NextResponse.json({ error: "Not found" }, { status: 404, headers: corsHeaders });
    }
    const subdomain = (searchParams.get("subdomain") || "blog").toLowerCase();
    try {
      const row = await cms.getPublishedPostBySlugForSubdomain(slugParam, subdomain);
      if (!row) {
        return NextResponse.json({ error: "Not found" }, { status: 404, headers: corsHeaders });
      }
      return NextResponse.json({ post: serializePublicPost(row) }, { headers: corsHeaders });
    } catch (e) {
      return NextResponse.json({ error: e.message || "Failed" }, { status: 500, headers: corsHeaders });
    }
  }

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

  const subdomain = (searchParams.get("subdomain") || "blog").toLowerCase();
  const statusFilter = (searchParams.get("status") || "published").toLowerCase();
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10) || 50, 100);
  const offset = parseInt(searchParams.get("offset") || "0", 10) || 0;

  if (!isPostgresConfigured()) {
    return NextResponse.json({ posts: [] }, { headers: corsHeaders });
  }

  if (statusFilter !== "published") {
    return NextResponse.json({ error: "Only status=published is public" }, { status: 400, headers: corsHeaders });
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
    const posts = (rows || []).map((r) => serializePublicPost(r));
    return NextResponse.json({ posts }, { headers: corsHeaders });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500, headers: corsHeaders });
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
