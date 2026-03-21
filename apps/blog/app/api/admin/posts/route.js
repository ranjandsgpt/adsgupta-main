import { NextResponse } from "next/server";
import { getUser } from "../../../../lib/auth.js";
import { getAllPostsForAdmin, createPost } from "../../../../lib/db.js";

async function requireAdmin() {
  const user = await getUser();
  if (!user) return null;
  return user;
}

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const posts = getAllPostsForAdmin();
  return NextResponse.json(posts);
}

export async function POST(request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const id = createPost({
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
    return NextResponse.json({ id });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Failed to create post" }, { status: 500 });
  }
}
