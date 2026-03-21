// Prototype script to convert Blogspot content into individual markdown stories.
// Not used by the Next.js build; run manually with Node.
//
// Target source:
//   https://ifiwasbornasanad.blogspot.com
//
// Goal:
//   Split "100 Stories on Programmatic Advertising" into separate markdown files:
//   story-01-arrival-of-programmatic.md, story-02-algorithm-quest.md, ...

const fs = require("fs");
const path = require("path");

function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function writeStory(index, title, body) {
  const indexPadded = String(index).padStart(2, "0");
  const slugPart = toSlug(title || `story-${indexPadded}`);
  const slug = `story-${indexPadded}-${slugPart}`;

  const postsDir = path.join(process.cwd(), "posts");
  if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir);

  const frontmatter = [
    "---",
    `title: "${title || `Story ${indexPadded}`}"`,
    `category: "Neural Philosophical"`,
    `source: "Blogspot"`,
    "---",
    "",
  ].join("\n");

  const content = `${frontmatter}${body || ""}\n`;
  const filePath = path.join(postsDir, `${slug}.md`);
  fs.writeFileSync(filePath, content, "utf8");
}

function main() {
  console.log(
    "Blogspot import prototype. Fetch and parse HTML, then call writeStory(index, title, body) per story."
  );
  // TODO:
  // - Fetch the Blogspot page HTML (e.g. with node-fetch or manual export)
  // - Identify each story block, extract heading and paragraphs
  // - Call writeStory() for each story.
}

if (require.main === module) {
  main();
}

