/**
 * Shared HTML → posts migration for ranjan.adsgupta.com static blog files.
 * Used by scripts/migrate-ranjan-posts.cjs and GET /api/migrate-ranjan.
 */
import fs from "node:fs";
import path from "node:path";

export function stripTags(s) {
  return String(s || "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extract(html, re) {
  const m = html.match(re);
  return m ? m[1] : "";
}

export function parsePostHtml(html, slug) {
  const titleRaw = extract(html, /<h1[^>]*class=["'][^"']*post-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i);
  const title = stripTags(titleRaw) || slug;

  const kickerRaw = extract(html, /<p[^>]*class=["'][^"']*hero-kicker[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);
  let category = "";
  const kickerText = stripTags(kickerRaw);
  if (kickerText.includes("·")) {
    const parts = kickerText.split("·").map((p) => p.trim());
    category = parts[parts.length - 1] || kickerText;
  } else {
    category = kickerText.replace(/^The Archives\s*/i, "").trim() || "General";
  }

  const excerptRaw = extract(html, /<p[^>]*class=["'][^"']*hero-description[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);
  let excerpt = stripTags(excerptRaw);
  if (!excerpt) {
    excerpt = extract(html, /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  }
  if (!excerpt) excerpt = title.slice(0, 220);

  const articleMatch = html.match(/<article[^>]*class=["'][^"']*prose[^"']*["'][^>]*>([\s\S]*?)<\/article>/i);
  const content = articleMatch ? articleMatch[1].trim() : "";
  if (!content) {
    return null;
  }

  let readTime = 5;
  const pillMatch = html.match(/<span[^>]*class=["'][^"']*meta-pill[^"']*["'][^>]*>([^<]*(?:min read|min\.)[^<]*)<\/span>/i);
  if (pillMatch) {
    const n = parseInt(String(pillMatch[1]).replace(/\D/g, ""), 10);
    if (!Number.isNaN(n) && n > 0) readTime = n;
  }

  return {
    slug,
    title: title.slice(0, 500),
    category: category.slice(0, 200) || "General",
    excerpt: excerpt.slice(0, 2000),
    content,
    read_time_minutes: readTime,
  };
}

/**
 * @param {object} opts
 * @param {function} opts.sql - tagged template from lib/db.js (Neon)
 * @param {string} opts.ranjanBlogRoot - absolute path to apps/ranjan/blog
 * @param {string} opts.authorEmail
 * @param {string} opts.authorName
 */
export async function migrateRanjanPosts({ sql, ranjanBlogRoot, authorEmail, authorName }) {
  const errors = [];
  if (!fs.existsSync(ranjanBlogRoot)) {
    return {
      migrated: 0,
      skipped: 0,
      failed: 0,
      total: 0,
      errors: [`Ranjan blog path not found: ${ranjanBlogRoot}`],
    };
  }

  const entries = fs.readdirSync(ranjanBlogRoot, { withFileTypes: true });
  const dirs = entries.filter((d) => d.isDirectory()).map((d) => d.name);
  const total = dirs.length;
  let migrated = 0;
  let skipped = 0;
  let failed = 0;
  const emptyTags = [];

  for (const slug of dirs.sort()) {
    const filePath = path.join(ranjanBlogRoot, slug, "index.html");
    if (!fs.existsSync(filePath)) {
      skipped += 1;
      continue;
    }

    let html;
    try {
      html = fs.readFileSync(filePath, "utf8");
    } catch (e) {
      failed += 1;
      errors.push(`${slug}: ${e.message || "read failed"}`);
      continue;
    }

    const parsed = parsePostHtml(html, slug);
    if (!parsed) {
      skipped += 1;
      continue;
    }

    try {
      const publishedAt = new Date().toISOString();
      const { rows } = await sql`
        INSERT INTO posts (
          slug, title, subtitle, content, excerpt, cover_image, category, tags, status, author_email, author_name,
          seo_title, seo_description, og_image, read_time_minutes, featured, scheduled_at, published_at,
          publish_to_blog, publish_to_ranjan, publish_to_pousali,
          crosspost_linkedin, crosspost_instagram, crosspost_facebook, crosspost_twitter
        ) VALUES (
          ${parsed.slug},
          ${parsed.title},
          ${null},
          ${parsed.content},
          ${parsed.excerpt},
          ${null},
          ${parsed.category},
          ${emptyTags},
          ${"published"},
          ${authorEmail},
          ${authorName},
          ${parsed.title},
          ${parsed.excerpt},
          ${null},
          ${parsed.read_time_minutes},
          ${false},
          ${null},
          ${publishedAt},
          ${true},
          ${true},
          ${false},
          ${false},
          ${false},
          ${false},
          ${false}
        )
        ON CONFLICT (slug) DO NOTHING
        RETURNING id
      `;

      if (rows && rows.length > 0) {
        migrated += 1;
      } else {
        skipped += 1;
      }
    } catch (e) {
      failed += 1;
      errors.push(`${slug}: ${e.message || String(e)}`);
    }
  }

  return { migrated, skipped, failed, total, errors };
}

/** Resolve apps/ranjan/blog from apps/blog cwd (Next.js) or monorepo root. */
export function resolveRanjanBlogRoot(cwd = process.cwd()) {
  const a = path.join(cwd, "..", "ranjan", "blog");
  if (fs.existsSync(a)) return path.resolve(a);
  const b = path.join(cwd, "ranjan", "blog");
  if (fs.existsSync(b)) return path.resolve(b);
  return path.resolve(a);
}
