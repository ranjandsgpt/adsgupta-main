/**
 * One-time migration: copy static ranjan blog HTML posts into Postgres `posts`.
 *
 * Read-only: apps/ranjan/blog/<slug>/index.html (does not modify ranjan files).
 *
 * From apps/blog:
 *
 *   npm run migrate:ranjan
 *
 * Uses @neondatabase/serverless (same as lib/db.js). Loads .env.local via dotenv when present.
 */
const fs = require("node:fs");
const path = require("node:path");
const { neon } = require("@neondatabase/serverless");

const scriptDir = path.dirname(path.resolve(process.argv[1]));

// dotenv optional — add "dotenv" to package.json dependencies
try {
  const dotenv = require("dotenv");
  const envLocal = path.join(scriptDir, "../.env.local");
  const envFile = path.join(scriptDir, "../.env");
  if (fs.existsSync(envLocal)) dotenv.config({ path: envLocal });
  if (fs.existsSync(envFile)) dotenv.config({ path: envFile });
} catch {
  /* dotenv not installed — rely on manual env */
}

let _neon = null;
function sql(strings, ...values) {
  const url = process.env.POSTGRES_URL;
  if (!url) {
    throw new Error("POSTGRES_URL is not set");
  }
  if (!_neon) {
    _neon = neon(url);
  }
  return _neon(strings, ...values).then((result) => {
    const rows = Array.isArray(result) ? result : [];
    return { rows, rowCount: rows.length };
  });
}

async function main() {
  const email = process.env.ADMIN_USER_1_EMAIL || "ranjan@adsgupta.com";
  const authorName = process.env.ADMIN_USER_1_NAME || "Ranjan Dasgupta";

  if (!process.env.POSTGRES_URL) {
    console.error("POSTGRES_URL is required.");
    process.exit(1);
  }

  const ranjanBlogRoot = path.join(scriptDir, "../../ranjan/blog");
  if (!fs.existsSync(ranjanBlogRoot)) {
    console.error("Path not found:", ranjanBlogRoot);
    process.exit(1);
  }

  const { migrateRanjanPosts } = await import("../lib/migrate-ranjan-html.js");
  const result = await migrateRanjanPosts({
    sql,
    ranjanBlogRoot,
    authorEmail: email,
    authorName,
  });

  console.log(
    `Done. Migrated: ${result.migrated}, skipped: ${result.skipped}, failed: ${result.failed}, folders: ${result.total}`
  );
  if (result.errors?.length) {
    result.errors.forEach((e) => console.error(e));
  }
  if (result.failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
