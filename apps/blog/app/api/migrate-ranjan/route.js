/**
 * TEMPORARY one-shot migration: create CMS tables + import ranjan static HTML posts into Postgres.
 * Delete this route after migration is complete (or leave disabled).
 */
import { NextResponse } from "next/server";
import { createTables } from "../../../lib/db-init.js";
import { sql } from "../../../lib/db.js";
import { migrateRanjanPosts, resolveRanjanBlogRoot } from "../../../lib/migrate-ranjan-html.js";

function getSecret(request) {
  return request.nextUrl.searchParams.get("secret")?.trim() || "";
}

export async function GET(request) {
  const secret = getSecret(request);
  if (!process.env.DB_INIT_SECRET || secret !== process.env.DB_INIT_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.POSTGRES_URL) {
    return NextResponse.json({ error: "POSTGRES_URL is not set" }, { status: 500 });
  }

  const authorEmail = process.env.ADMIN_USER_1_EMAIL || "ranjan@adsgupta.com";
  const authorName = process.env.ADMIN_USER_1_NAME || "Ranjan Dasgupta";

  try {
    await createTables();
  } catch (e) {
    return NextResponse.json(
      { error: `createTables failed: ${e.message || e}`, migrated: 0, skipped: 0, failed: 0, total: 0, errors: [String(e.message || e)] },
      { status: 500 }
    );
  }

  const ranjanBlogRoot = resolveRanjanBlogRoot(process.cwd());

  try {
    const result = await migrateRanjanPosts({
      sql,
      ranjanBlogRoot,
      authorEmail,
      authorName,
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      {
        error: e.message || "migration failed",
        migrated: 0,
        skipped: 0,
        failed: 0,
        total: 0,
        errors: [String(e.message || e)],
      },
      { status: 500 }
    );
  }
}
