/**
 * Shared migration helpers for ranjan static blog → Postgres `posts`.
 * HTML parsing + filesystem: migrateRanjanPosts.
 * Embedded JSON (Vercel): migrateRanjanPostsFromRecords.
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

const emptyTags = [];

async function insertRanjanRow(sql, row, authorEmail, authorName) {
  const readTime = row.read_time_minutes ?? row.read_time ?? 5;
  const publishedAt = new Date().toISOString();
  const { rows } = await sql`
    INSERT INTO posts (
      slug, title, subtitle, content, excerpt, cover_image, category, tags, status, author_email, author_name,
      seo_title, seo_description, og_image, read_time_minutes, featured, scheduled_at, published_at,
      publish_to_blog, publish_to_ranjan, publish_to_pousali,
      crosspost_linkedin, crosspost_instagram, crosspost_facebook, crosspost_twitter
    ) VALUES (
      ${row.slug},
      ${row.title},
      ${null},
      ${row.content},
      ${row.excerpt},
      ${null},
      ${row.category},
      ${emptyTags},
      ${"published"},
      ${authorEmail},
      ${authorName},
      ${row.title},
      ${row.excerpt},
      ${null},
      ${readTime},
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
  return rows && rows.length > 0 ? "migrated" : "skipped";
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
      const r = await insertRanjanRow(sql, parsed, authorEmail, authorName);
      if (r === "migrated") migrated += 1;
      else skipped += 1;
    } catch (e) {
      failed += 1;
      errors.push(`${slug}: ${e.message || String(e)}`);
    }
  }

  return { migrated, skipped, failed, total, errors };
}

/**
 * Insert from embedded JSON (plain-text content, read_time minutes).
 * @param {object} opts
 * @param {Array<{slug:string,title:string,category:string,excerpt:string,content:string,read_time?:number,read_time_minutes?:number}>} opts.records
 */
export async function migrateRanjanPostsFromRecords({ sql, records, authorEmail, authorName }) {
  const errors = [];
  const total = records.length;
  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const rec of records) {
    const slug = rec.slug || "unknown";
    try {
      const row = {
        slug: rec.slug,
        title: rec.title,
        category: rec.category,
        excerpt: rec.excerpt,
        content: rec.content,
        read_time_minutes: rec.read_time ?? rec.read_time_minutes ?? 5,
      };
      if (!row.slug || !row.title) {
        skipped += 1;
        continue;
      }
      const r = await insertRanjanRow(sql, row, authorEmail, authorName);
      if (r === "migrated") migrated += 1;
      else skipped += 1;
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
