import { NextResponse } from "next/server";
import { getUser } from "../../../../../lib/auth.js";
import { getPostById, updatePost, deletePost } from "../../../../../lib/db.js";

async function requireAdmin() {
  const user = await getUser();
  if (!user) return null;
  return user;
}

export async function GET(request, { params }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = parseInt(params.id, 10);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const post = getPostById(id);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(request, { params }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = parseInt(params.id, 10);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  try {
    const body = await request.json();
    updatePost(id, {
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
  const id = parseInt(params.id, 10);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  deletePost(id);
  return NextResponse.json({ success: true });
}
