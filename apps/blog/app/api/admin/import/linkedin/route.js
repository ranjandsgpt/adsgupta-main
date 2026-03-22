import { NextResponse } from "next/server";
import { getUser } from "../../../../../lib/auth.js";
import { isPostgresConfigured } from "../../../../../lib/cms-runtime.js";
import * as cms from "../../../../../lib/cms-pg.js";

async function requireAdmin() {
  const user = await getUser();
  if (!user) return null;
  return user;
}

export async function POST(request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isPostgresConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  try {
    const { url } = await request.json();
    if (!url || !url.includes("linkedin.com")) {
      return NextResponse.json({ error: "Invalid LinkedIn URL" }, { status: 400 });
    }
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AdsGuptaBlog/1.0)" },
    });
    if (!res.ok) return NextResponse.json({ error: "Could not fetch URL" }, { status: 400 });
    const html = await res.text();
    const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/) || html.match(/<title>([^<]+)<\/title>/);
    const title = titleMatch ? (titleMatch[1] || "").trim().replace(/&amp;/g, "&").replace(/&#39;/g, "'") : "LinkedIn Article";
    const descMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/);
    const excerpt = descMatch ? (descMatch[1] || "").trim().replace(/&amp;/g, "&").slice(0, 300) : "";
    let content = "";
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) || html.match(/<div[^>]*class="[^"]*post-content[^"]*"[\s\S]*?>([\s\S]*?)(?:<\/div>|$)/i);
    if (articleMatch) {
      content = articleMatch[1]
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/\s+/g, " ")
        .trim();
      if (content.length > 50) content = content.slice(0, 50000);
    }
    if (!content) {
      const pMatch = html.match(/<p[^>]*>[\s\S]*?<\/p>/gi);
      if (pMatch) content = pMatch.slice(0, 30).join(" ").replace(/\s+/g, " ").trim().slice(0, 20000);
    }
    if (!content) content = `<p>Content extracted from LinkedIn. Original: <a href="${url}">${url}</a></p>`;
    const slugBase = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100) || "linkedin-article";
    const slug = `${slugBase}-${Date.now().toString(36)}`;
    const subdomain = user.subdomain || "ranjan";
    const id = await cms.createPost(
      user.email,
      {
        title,
        slug,
        content,
        excerpt,
        category: "Programmatic Strategy",
        status: "draft",
      },
      subdomain,
      user.name
    );
    return NextResponse.json({ id, slug, message: "Post created as draft" });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Import failed" }, { status: 500 });
  }
}
