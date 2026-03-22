/**
 * Build-time: read apps/ranjan/blog/<slug>/index.html and write apps/blog/data/ranjan-posts.json
 * for Vercel migration (HTML is not bundled in apps/blog deploy).
 */
const fs = require("node:fs");
const path = require("node:path");

const scriptDir = path.dirname(path.resolve(process.argv[1]));
const blogRoot = path.join(scriptDir, "..");
const ranjanBlogRoot = path.join(blogRoot, "..", "ranjan", "blog");
const outDir = path.join(blogRoot, "data");
const outFile = path.join(outDir, "ranjan-posts.json");

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
  const articleHtml = articleMatch ? articleMatch[1].trim() : "";
  if (!articleHtml) {
    return null;
  }

  const content = stripTags(articleHtml);

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
    read_time: readTime,
  };
}

function main() {
  if (!fs.existsSync(ranjanBlogRoot)) {
    console.error("Ranjan blog not found:", ranjanBlogRoot);
    process.exit(1);
  }

  const entries = fs.readdirSync(ranjanBlogRoot, { withFileTypes: true });
  const dirs = entries.filter((d) => d.isDirectory()).map((d) => d.name);
  const records = [];

  for (const slug of dirs.sort()) {
    const filePath = path.join(ranjanBlogRoot, slug, "index.html");
    if (!fs.existsSync(filePath)) continue;
    let html;
    try {
      html = fs.readFileSync(filePath, "utf8");
    } catch (e) {
      console.warn("Skip read:", slug, e.message);
      continue;
    }
    const parsed = parsePostHtml(html, slug);
    if (parsed) records.push(parsed);
  }

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  fs.writeFileSync(outFile, JSON.stringify(records, null, 0), "utf8");
  console.log(`Wrote ${records.length} posts to ${path.relative(blogRoot, outFile)}`);
}

main();
