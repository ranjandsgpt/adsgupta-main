import { NextResponse } from "next/server";
import { isPostgresConfigured } from "../../../../lib/cms-runtime.js";
import { sql } from "../../../../lib/db.js";
import { rateLimit, clientKeyFromRequest } from "../../../../lib/rate-limit.js";

export async function POST(request) {
  const key = `track:${clientKeyFromRequest(request)}`;
  const limited = rateLimit(key, { max: 120, windowMs: 60_000 });
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } });
  }

  const body = await request.json().catch(() => ({}));
  const slug = String(body.slug || "").trim();
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  if (!isPostgresConfigured()) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    const { rows } = await sql`
      SELECT id FROM posts WHERE slug = ${slug} LIMIT 1
    `;
    const postId = rows[0]?.id || null;

    await sql`
      INSERT INTO analytics_events (post_id, event_type, session_id, referrer, country, device)
      VALUES (
        ${postId},
        ${body.event_type || "view"},
        ${body.session_id || null},
        ${body.referrer || null},
        ${body.country || null},
        ${body.device || null}
      )
    `;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message || "track failed" }, { status: 500 });
  }
}
