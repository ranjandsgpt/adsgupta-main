import { NextResponse } from "next/server";
import { getUser } from "../../../lib/auth.js";
import { isPostgresConfigured } from "../../../lib/cms-runtime.js";
import { sql } from "../../../lib/db.js";

/** Authenticated analytics summary (same payload as /api/admin/analytics/summary). */
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isPostgresConfigured()) {
    return NextResponse.json({ series: [], topPosts: [], sources: [], devices: [] });
  }

  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { rows: events } = await sql`
      SELECT e.post_id, e.event_type, e.referrer, e.device, e.created_at
      FROM analytics_events e
      INNER JOIN posts p ON p.id = e.post_id
      WHERE p.author_email = ${user.email}
      AND e.created_at >= ${since}::timestamptz
    `;

    const byDay = {};
    const byPost = {};
    const sources = {};
    const devices = {};

    (events || []).forEach((ev) => {
      if (ev.event_type === "view") {
        const d = ev.created_at ? String(ev.created_at).slice(0, 10) : "";
        byDay[d] = (byDay[d] || 0) + 1;
        if (ev.post_id) {
          byPost[ev.post_id] = (byPost[ev.post_id] || 0) + 1;
        }
        const ref = ev.referrer || "direct";
        sources[ref] = (sources[ref] || 0) + 1;
        const dev = ev.device || "unknown";
        devices[dev] = (devices[dev] || 0) + 1;
      }
    });

    const series = Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, views]) => ({ date, views }));

    const { rows: postRows } = await sql`
      SELECT id, title, slug FROM posts WHERE author_email = ${user.email}
    `;
    const titleById = Object.fromEntries((postRows || []).map((p) => [String(p.id), p]));

    const topPosts = Object.entries(byPost)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, views]) => ({
        id,
        views,
        title: titleById[id]?.title || "—",
        slug: titleById[id]?.slug,
      }));

    return NextResponse.json({
      series,
      topPosts,
      sources: Object.entries(sources).map(([name, value]) => ({ name, value })),
      devices: Object.entries(devices).map(([name, value]) => ({ name, value })),
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
