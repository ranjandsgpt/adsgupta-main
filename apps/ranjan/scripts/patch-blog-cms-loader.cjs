/**
 * One-time: add data-cms-slug + CMS scripts to each apps/ranjan/blog/<slug>/index.html
 * (does not change article inner HTML).
 */
const fs = require("fs");
const path = require("path");

const blogRoot = path.join(__dirname, "../blog");
const snippets = [
  '<script src="/blog/cms-config.js"></script>',
  '<script src="/blog-loader.js"></script>',
].join("\n  ");

let patched = 0;
let skipped = 0;

for (const name of fs.readdirSync(blogRoot)) {
  const dir = path.join(blogRoot, name);
  if (!fs.statSync(dir).isDirectory()) continue;
  const file = path.join(dir, "index.html");
  if (!fs.existsSync(file)) continue;

  let html = fs.readFileSync(file, "utf8");
  if (html.includes("data-cms-slug") && html.includes("blog-loader.js")) {
    skipped += 1;
    continue;
  }

  if (!html.includes("data-cms-slug")) {
    const replaced = html.replace(
      /<article\s+class=["']prose["']/i,
      '<article class="prose" data-cms-slug="' + name + '"'
    );
    if (replaced === html) {
      console.warn("No article.prose match:", name);
      skipped += 1;
      continue;
    }
    html = replaced;
  }

  if (!html.includes("blog-loader.js")) {
    html = html.replace(/<\/body>/i, "  " + snippets + "\n</body>");
  }

  fs.writeFileSync(file, html, "utf8");
  patched += 1;
}

console.log("Patched:", patched, "skipped:", skipped);
