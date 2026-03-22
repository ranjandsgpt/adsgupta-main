import * as cms from "./cms-pg.js";
import { slugify } from "./slugify.js";

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

async function importSingleUrl(user, singleUrl) {
  const subdomain = user.subdomain || "ranjan";
  const res = await fetch(singleUrl, { headers: { "User-Agent": "Mozilla/5.0 (compatible; AdsGuptaBlog/1.0)" } });
  if (!res.ok) return { ok: false, status: 400, body: { error: "Could not fetch URL" } };
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
    return { ok: false, status: 400, body: { error: "Post with this slug already exists", imported: 0, skipped: 1 } };
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
  return { ok: true, status: 200, body: { imported: 1, skipped: 0, slug: slugBase } };
}

async function importBatchFromIndex(user) {
  const subdomain = user.subdomain || "ranjan";
  let imported = 0;
  let skipped = 0;
  const baseUrl = "https://ifiwasbornasanad.blogspot.com";
  const indexRes = await fetch(`${baseUrl}/2024/04/100-stories-on-programmatic-advertising.html`, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; AdsGuptaBlog/1.0)" },
  });
  if (!indexRes.ok) {
    return {
      ok: false,
      status: 400,
      body: {
        error: "Could not fetch Blogspot index. Provide a single post URL instead.",
        imported: 0,
        skipped: 0,
      },
    };
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
  return { ok: true, status: 200, body: { imported, skipped } };
}

/** Extract <link> inside each RSS <item> (best-effort). */
export async function importFromRssFeed(user, feedUrl, { maxItems = 25 } = {}) {
  const subdomain = user.subdomain || "ranjan";
  const res = await fetch(feedUrl, { headers: { "User-Agent": "Mozilla/5.0 (compatible; AdsGuptaBlog/1.0)" } });
  if (!res.ok) return { ok: false, status: 400, body: { error: "Could not fetch RSS feed" } };
  const xml = await res.text();
  const items = xml.split(/<item[\s>]/i).slice(1);
  let imported = 0;
  let skipped = 0;
  for (const block of items.slice(0, maxItems)) {
    const m = block.match(/<link[^>]*>([^<]+)<\/link>/i);
    const link = m ? m[1].trim() : "";
    if (!link || (!link.includes("blogspot.com") && !link.includes("blogger.com"))) continue;
    const r = await importSingleUrl(user, link);
    if (r.ok) imported++;
    else if (r.body?.skipped) skipped++;
    else if (r.body?.error?.includes("already exists")) skipped++;
  }
  return { ok: true, status: 200, body: { imported, skipped, feed: feedUrl } };
}

/**
 * @param {object} user - from getUser()
 * @param {{ url?: string, feed?: string }} options
 */
export async function runBlogspotImport(user, options = {}) {
  const singleUrl = options.url && String(options.url).trim();
  const feedUrl = options.feed && String(options.feed).trim();

  if (feedUrl) {
    return importFromRssFeed(user, feedUrl);
  }

  if (singleUrl && (singleUrl.includes("blogspot.com") || singleUrl.includes("blogger.com"))) {
    return importSingleUrl(user, singleUrl);
  }

  if (singleUrl) {
    return { ok: false, status: 400, body: { error: "URL must be a Blogspot/Blogger page" } };
  }

  return importBatchFromIndex(user);
}
