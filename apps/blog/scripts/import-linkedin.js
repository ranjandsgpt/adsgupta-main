// Prototype script to convert LinkedIn articles into markdown files under /posts.
// This file is NOT used by the Next.js build and can be run manually with Node.
//
// Usage idea:
//   node scripts/import-linkedin.js path/to/linkedin-export.json

const fs = require("fs");
const path = require("path");

function toSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function writePost({ title, body, date, category, source }) {
  const slug = toSlug(title || "linkedin-article");
  const postsDir = path.join(process.cwd(), "posts");
  if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir);

  const frontmatter = [
    "---",
    `title: "${title || "Untitled"}"`,
    date ? `date: "${date}"` : null,
    category ? `category: "${category}"` : null,
    `source: "${source || "LinkedIn"}"`,
    "---",
    "",
  ]
    .filter(Boolean)
    .join("\n");

  const content = `${frontmatter}${body || ""}\n`;
  const filePath = path.join(postsDir, `${slug}.md`);
  fs.writeFileSync(filePath, content, "utf8");
}

function main() {
  console.log(
    "LinkedIn import prototype. Wire this up to your export format before use."
  );
  // TODO: Read LinkedIn export, map fields to { title, body, date }, then call writePost(...)
}

if (require.main === module) {
  main();
}

