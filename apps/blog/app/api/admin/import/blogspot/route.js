import { NextResponse } from "next/server";
import { getUser } from "../../../../../lib/auth.js";
import { isPostgresConfigured } from "../../../../../lib/cms-runtime.js";
import * as cms from "../../../../../lib/cms-pg.js";
import { slugify } from "../../../../../lib/slugify.js";

async function requireAdmin() {
  const user = await getUser();
  if (!user) return null;
  return user;
}

function htmlToSimple(html) {
  if (!html) return "";
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<p[^>]*>/gi, "\n")
    .replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, "\n## $1\n")
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**")
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**")
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*")
    .replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function POST(request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isPostgresConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const subdomain = user.subdomain || "ranjan";
  let imported = 0;
  let skipped = 0;
  try {
    const body = await request.json().catch(() => ({}));
    const singleUrl = body.url && String(body.url).trim();

    if (singleUrl && (singleUrl.includes("blogspot.com") || singleUrl.includes("blogger.com"))) {
      const res = await fetch(singleUrl, { headers: { "User-Agent": "Mozilla/5.0 (compatible; AdsGuptaBlog/1.0)" } });
      if (!res.ok) return NextResponse.json({ error: "Could not fetch URL" }, { status: 400 });
      const html = await res.text();
      const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/) || html.match(/<title>([^<]+)<\/title>/);
      const title = titleMatch ? (titleMatch[1] || "").trim().replace(/&amp;/g, "&") : "Blogspot Post";
      const slugBase =
        (slugify(title) || "blogspot-post") +
        "-" +
        singleUrl
          .split("/")
          .filter(Boolean)
          .pop()
          .replace(/\.html?$/i, "")
          .slice(-12);
      if (await cms.slugExists(slugBase)) {
        return NextResponse.json({ error: "Post with this slug already exists", imported: 0, skipped: 1 });
      }
      const articleMatch =
        html.match(/<div[^>]*class="[^"]*post-body[^"]*"[\s\S]*?>([\s\S]*?)(?:<\/div>\s*<div|$)/i) ||
        html.match(/<article[\s\S]*?>([\s\S]*?)<\/article>/i);
      let content = articleMatch ? htmlToSimple(articleMatch[1]) : htmlToSimple(html);
      if (content.length < 100) content = `<p>Imported from <a href="${singleUrl}">Blogspot</a>.</p>`;
      const excerpt = content.replace(/\s+/g, " ").trim().slice(0, 160) + "…";
      await cms.createPost(
        user.email,
        {
          title,
          slug: slugBase,
          content,
          excerpt,
          category: "Neural Philosophical",
          status: "draft",
        },
        subdomain,
        user.name
      );
      return NextResponse.json({ imported: 1, skipped: 0, slug: slugBase });
    }

    const baseUrl = "https://ifiwasbornasanad.blogspot.com";
    const indexRes = await fetch(`${baseUrl}/2024/04/100-stories-on-programmatic-advertising.html`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AdsGuptaBlog/1.0)" },
    });
    if (!indexRes.ok) {
      return NextResponse.json(
        { error: "Could not fetch Blogspot index. Provide a single post URL instead.", imported: 0, skipped: 0 },
        { status: 400 }
      );
    }
    const indexHtml = await indexRes.text();
    const linkMatches = indexHtml.matchAll(/<a[^>]*href="(https?:\/\/ifiwasbornasanad\.blogspot\.com\/[^"]+)"[^>]*>/gi);
    const urls = [...new Set([...linkMatches].map((m) => m[1]).filter((u) => u.includes("/202") && !u.includes("comment") && !u.includes("search")))];

    for (const url of urls.slice(0, 50)) {
      try {
        const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; AdsGuptaBlog/1.0)" } });
        if (!res.ok) continue;
        const html = await res.text();
        const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/) || html.match(/<title>([^<]+)<\/title>/);
        const title = titleMatch ? (titleMatch[1] || "").trim().replace(/&amp;/g, "&") : "Blogspot Post";
        const slug =
          (slugify(title) || "blogspot-post") +
          "-" +
          url
            .split("/")
            .filter(Boolean)
            .pop()
            .replace(/\.html?$/, "")
            .slice(-8);
        if (await cms.slugExists(slug)) {
          skipped++;
          continue;
        }
        const articleMatch =
          html.match(/<div[^>]*class="[^"]*post-body[^"]*"[\s\S]*?>([\s\S]*?)(?:<\/div>|$)/i) ||
          html.match(/<article[\s\S]*?>([\s\S]*?)<\/article>/i);
        let content = articleMatch ? htmlToSimple(articleMatch[1]) : htmlToSimple(html);
        if (content.length < 100) content = `<p>Imported from <a href="${url}">Blogspot</a>. ${content}</p>`;
        const excerpt = content.replace(/\s+/g, " ").trim().slice(0, 160) + "…";
        await cms.createPost(
          user.email,
          {
            title,
            slug,
            content,
            excerpt,
            category: "Neural Philosophical",
            status: "draft",
          },
          subdomain,
          user.name
        );
        imported++;
      } catch (_) {}
    }
    return NextResponse.json({ imported, skipped });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Import failed", imported, skipped }, { status: 500 });
  }
}
