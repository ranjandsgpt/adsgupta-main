/**
 * One-time migration: copy static ranjan blog HTML posts into Postgres `posts`.
 *
 * Read-only: apps/ranjan/blog/**/index.html (does not modify ranjan files).
 *
 * From apps/blog:
 *
 *   npm run migrate:ranjan
 *
 * Requires POSTGRES_URL, ADMIN_USER_1_EMAIL (and optionally ADMIN_USER_1_NAME).
 * Loads apps/blog/.env.local when present.
 */
const fs = require("node:fs");
const path = require("node:path");

const __dirname = path.dirname(path.resolve(process.argv[1]));

function loadEnvLocal() {
  const candidates = [
    path.join(__dirname, "../.env.local"),
    path.join(__dirname, "../.env"),
    path.join(__dirname, "../../../.env.local"),
  ];
  for (const p of candidates) {
    if (!fs.existsSync(p)) continue;
    const raw = fs.readFileSync(p, "utf8");
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq <= 0) continue;
      const key = t.slice(0, eq).trim();
      let val = t.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = val;
    }
    break;
  }
}

function stripTags(s) {
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

function parsePostHtml(html, slug) {
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
  let content = articleMatch ? articleMatch[1].trim() : "";
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

async function main() {
  loadEnvLocal();

  const email = process.env.ADMIN_USER_1_EMAIL;
  const authorName = process.env.ADMIN_USER_1_NAME || "Ranjan Dasgupta";

  if (!email) {
    console.error("ADMIN_USER_1_EMAIL is required.");
    process.exit(1);
  }
  if (!process.env.POSTGRES_URL) {
    console.error("POSTGRES_URL is required.");
    process.exit(1);
  }

  const ranjanBlogRoot = path.join(__dirname, "../../ranjan/blog");
  if (!fs.existsSync(ranjanBlogRoot)) {
    console.error("Path not found:", ranjanBlogRoot);
    process.exit(1);
  }

  const { sql } = await import("../lib/db.js");

  const entries = fs.readdirSync(ranjanBlogRoot, { withFileTypes: true });
  const dirs = entries.filter((d) => d.isDirectory()).map((d) => d.name);
  const total = dirs.length;
  let migrated = 0;
  let skipped = 0;
  let failed = 0;
  let index = 0;
  const emptyTags = [];

  for (const slug of dirs.sort()) {
    index += 1;
    const filePath = path.join(ranjanBlogRoot, slug, "index.html");
    if (!fs.existsSync(filePath)) {
      console.warn(`Skip ${index}/${total}: [${slug}] — no index.html`);
      skipped += 1;
      continue;
    }

    let html;
    try {
      html = fs.readFileSync(filePath, "utf8");
    } catch (e) {
      console.error(`Read failed ${slug}:`, e.message);
      failed += 1;
      continue;
    }

    const parsed = parsePostHtml(html, slug);
    if (!parsed) {
      console.warn(`Skip ${index}/${total}: [${slug}] — could not parse article.prose`);
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
          ${email},
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
        console.log(`Migrated ${index}/${total}: [${slug}]`);
      } else {
        skipped += 1;
        console.log(`Skipped (exists) ${index}/${total}: [${slug}]`);
      }
    } catch (e) {
      failed += 1;
      console.error(`Error ${slug}:`, e.message || e);
    }
  }

  console.log(`Done. Migrated: ${migrated}, skipped: ${skipped}, failed: ${failed}, folders: ${total}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
