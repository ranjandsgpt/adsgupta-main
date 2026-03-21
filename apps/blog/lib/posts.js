import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const postsDirectory = path.join(process.cwd(), "posts");

function getAllSlugsFromFiles() {
  if (!fs.existsSync(postsDirectory)) return [];
  return fs
    .readdirSync(postsDirectory)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

function computeReadingTime(text) {
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 220));
  return {
    minutes,
    text: `${minutes} min read`,
  };
}

function buildExcerpt(content) {
  const normalized = content.replace(/\s+/g, " ").trim();
  const words = normalized.split(" ").slice(0, 40).join(" ");
  return normalized.length > words.length ? `${words}…` : normalized;
}

async function contentToHtml(content) {
  if (!content) return "";
  const trimmed = content.trim();
  if (trimmed.startsWith("<")) return trimmed;
  const processed = await remark().use(html).process(trimmed);
  return processed.toString();
}

function mapSupabaseListRow(row) {
  const minutes =
    row.read_time_minutes ||
    Math.max(1, Math.ceil(String(row.content || "").split(/\s+/).filter(Boolean).length / 220));
  const date = row.published_at || row.created_at;
  return {
    slug: row.slug,
    content: row.content,
    contentHtml: "",
    excerpt: row.excerpt || "",
    readingTime: { minutes, text: `${minutes} min read` },
    meta: {
      title: row.title,
      description: row.seo_description || row.excerpt || row.title,
      date,
      category: row.category,
      source: "AdsGupta",
      author: "AdsGupta",
      ogTitle: row.seo_title || row.title,
      ogDescription: row.seo_description || row.excerpt,
      ogImage: row.og_image || row.cover_image,
      showCta: true,
      ctaLabel: "Run your audit on DemoAI",
      ctaUrl: "https://demoai.adsgupta.com",
    },
  };
}

async function getPostBySlugFromSupabase(slug) {
  const { isSupabaseCmsEnabled } = await import("./cms-runtime.js");
  if (!isSupabaseCmsEnabled()) return null;
  const { createServerSupabase } = await import("./supabase-server.js");
  const { getPublishedPostBySlug } = await import("./supabase-cms.js");
  const supabase = createServerSupabase();
  const row = await getPublishedPostBySlug(supabase, slug);
  if (!row) return null;
  const contentHtml = await contentToHtml(row.content);
  const minutes =
    row.read_time_minutes ||
    Math.max(1, Math.ceil(String(row.content || "").split(/\s+/).filter(Boolean).length / 220));
  const date = row.published_at || row.created_at;
  return {
    slug: row.slug,
    content: row.content,
    contentHtml,
    excerpt: row.excerpt || "",
    readingTime: { minutes, text: `${minutes} min read` },
    meta: {
      title: row.title,
      description: row.seo_description || row.excerpt || row.title,
      date,
      category: row.category,
      source: "AdsGupta",
      author: "AdsGupta",
      ogTitle: row.seo_title || row.title,
      ogDescription: row.seo_description || row.excerpt,
      ogImage: row.og_image || row.cover_image,
      showCta: true,
      ctaLabel: "Run your audit on DemoAI",
      ctaUrl: "https://demoai.adsgupta.com",
    },
    source: "supabase",
  };
}

/** Prefer Supabase CMS; then SQLite; then markdown files. */
export async function getPostBySlug(slug) {
  try {
    const sup = await getPostBySlugFromSupabase(slug);
    if (sup) return sup;
  } catch (_) {
    /* continue */
  }
  try {
    const { getPostBySlug: getFromDb } = await import("./db.js");
    const row = getFromDb(slug);
    if (row) {
      const contentHtml = await contentToHtml(row.content);
      return {
        slug: row.slug,
        content: row.content,
        contentHtml,
        excerpt: row.excerpt,
        readingTime: row.readingTime,
        meta: row.meta,
        source: "db",
      };
    }
  } catch (_) {}
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const processedContent = await remark().use(html).process(content);
  const contentHtml = processedContent.toString();
  const readingTime = computeReadingTime(content);
  return {
    slug,
    content,
    contentHtml,
    excerpt: data.excerpt || buildExcerpt(content),
    readingTime,
    meta: {
      title: data.title || slug,
      description: data.description || buildExcerpt(content),
      date: data.date || null,
      category: data.category || null,
      source: data.source || "AdsGupta",
      author: data.author || "AdsGupta",
      ogTitle: data.ogTitle || data.title || slug,
      ogDescription: data.ogDescription || data.description || buildExcerpt(content),
      ogImage: data.ogImage || null,
      showCta: data.showCta !== false,
      ctaLabel: data.ctaLabel || "Run your audit on DemoAI",
      ctaUrl: data.ctaUrl || "https://demoai.adsgupta.com",
    },
  };
}

/** Published posts for blog.adsgupta.com — Supabase first when configured. */
export async function getAllPosts() {
  try {
    const { isSupabaseCmsEnabled } = await import("./cms-runtime.js");
    if (isSupabaseCmsEnabled()) {
      const { createServerSupabase } = await import("./supabase-server.js");
      const { listPublishedBlogPosts } = await import("./supabase-cms.js");
      const supabase = createServerSupabase();
      const rows = await listPublishedBlogPosts(supabase, { limit: 200 });
      if (rows.length > 0) {
        return rows.map(mapSupabaseListRow).sort((a, b) => {
          const aDate = a.meta?.date ? new Date(a.meta.date).getTime() : 0;
          const bDate = b.meta?.date ? new Date(b.meta.date).getTime() : 0;
          return bDate - aDate;
        });
      }
    }
  } catch (_) {
    /* fall through */
  }

  let fromDb = [];
  try {
    const { getAllPosts: getAllFromDb } = await import("./db.js");
    fromDb = getAllFromDb({ status: "published" });
  } catch (_) {}
  if (fromDb.length > 0) {
    const withHtml = await Promise.all(
      fromDb.map(async (row) => {
        const contentHtml = await contentToHtml(row.content);
        return {
          ...row,
          contentHtml,
        };
      })
    );
    return withHtml.sort((a, b) => {
      const aDate = a.meta?.date ? new Date(a.meta.date).getTime() : 0;
      const bDate = b.meta?.date ? new Date(b.meta.date).getTime() : 0;
      return bDate - aDate;
    });
  }
  const slugs = getAllSlugsFromFiles();
  const posts = await Promise.all(slugs.map((slug) => getPostBySlug(slug)));
  return posts.filter(Boolean).sort((a, b) => {
    const aDate = a.meta?.date ? new Date(a.meta.date).getTime() : 0;
    const bDate = b.meta?.date ? new Date(b.meta.date).getTime() : 0;
    return bDate - aDate;
  });
}

/** Slugs for SSG — merge Supabase, SQLite, markdown. */
export async function getPostSlugs() {
  const seen = new Map();
  try {
    const { isSupabaseCmsEnabled } = await import("./cms-runtime.js");
    if (isSupabaseCmsEnabled()) {
      const { createServerSupabase } = await import("./supabase-server.js");
      const supabase = createServerSupabase();
      const { data } = await supabase
        .from("posts")
        .select("slug")
        .eq("status", "published")
        .eq("publish_to_blog", true);
      (data || []).forEach((r) => seen.set(r.slug, true));
    }
  } catch (_) {}
  try {
    const { getPostSlugs: getSlugsFromDb } = await import("./db.js");
    const dbSlugs = getSlugsFromDb();
    dbSlugs.forEach((r) => seen.set(r.slug, true));
  } catch (_) {}
  getAllSlugsFromFiles().forEach((s) => seen.set(s, true));
  return [...seen.keys()].map((slug) => ({ slug }));
}

/**
 * Inject monetization slot and script after the Nth paragraph in HTML.
 * Returns { contentHtml, scriptHtml } so the page can render slot and script.
 */
export function injectMonetizationSlot(contentHtml, scriptHtml, afterParagraph = 3) {
  if (!scriptHtml || !contentHtml) return { contentHtml, scriptHtml: "" };
  const slot = '<div id="adsgupta-monetization-slot"></div>';
  const parts = contentHtml.split(/(<\/p>\s*)/i);
  let count = 0;
  const result = [];
  for (let i = 0; i < parts.length; i++) {
    result.push(parts[i]);
    if (/<\/p>/i.test(parts[i])) {
      count++;
      if (count === afterParagraph) {
        result.push(slot);
      }
    }
  }
  return {
    contentHtml: result.join(""),
    scriptHtml: scriptHtml.trim(),
  };
}
