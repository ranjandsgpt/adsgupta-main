import { NextResponse } from "next/server";
import { getUser, profileFromUser } from "../../../../lib/auth.js";
import { isPostgresConfigured } from "../../../../lib/cms-runtime.js";
import * as cms from "../../../../lib/cms-pg.js";

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

  if (!isPostgresConfigured()) {
    return NextResponse.json([]);
  }
  try {
    const posts = await cms.listPostsForAdmin(user.email, {
      status: status === "all" ? undefined : status,
      q,
    });
    return NextResponse.json(posts);
  } catch (e) {
    return NextResponse.json({ error: e.message || "Failed to list posts" }, { status: 500 });
  }
}

export async function POST(request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isPostgresConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  try {
    const body = await request.json();
    const profile = profileFromUser(user);
    const subdomain = profile?.subdomain || "ranjan";
    const id = await cms.createPost(user.email, body, subdomain, user.name);
    return NextResponse.json({ id });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Failed to create post" }, { status: 500 });
  }
}
