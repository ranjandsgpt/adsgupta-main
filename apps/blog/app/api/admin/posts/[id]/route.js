import { NextResponse } from "next/server";
import { getUser } from "../../../../../lib/auth.js";
import { isPostgresConfigured } from "../../../../../lib/cms-runtime.js";
import * as cms from "../../../../../lib/cms-pg.js";

async function requireAdmin() {
  const user = await getUser();
  if (!user) return null;
  return user;
}

export async function GET(request, { params }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = params.id;

  if (!isPostgresConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  try {
    const post = await cms.getPostById(user.email, id);
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(post);
  } catch (e) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = params.id;

  if (!isPostgresConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  try {
    const body = await request.json();
    const ok = await cms.updatePost(user.email, id, body);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = params.id;

  if (!isPostgresConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  try {
    const ok = await cms.deletePost(user.email, id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Failed to delete" }, { status: 500 });
  }
}
