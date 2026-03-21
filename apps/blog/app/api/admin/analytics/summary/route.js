import { NextResponse } from "next/server";
import { getUser } from "../../../../../lib/auth.js";
import { isSupabaseCmsEnabled } from "../../../../../lib/cms-runtime.js";
import { createServerSupabase } from "../../../../../lib/supabase-server.js";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSupabaseCmsEnabled()) {
    return NextResponse.json({ series: [], topPosts: [], sources: [], devices: [] });
  }

  try {
    const supabase = createServerSupabase();
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: posts } = await supabase.from("posts").select("id").eq("author_id", user.id);
    const ids = (posts || []).map((p) => p.id);
    if (!ids.length) {
      return NextResponse.json({ series: [], topPosts: [], sources: [], devices: [] });
    }

    const { data: events } = await supabase
      .from("analytics_events")
      .select("post_id, event_type, referrer, device, created_at")
      .in("post_id", ids)
      .gte("created_at", since);

    const byDay = {};
    const byPost = {};
    const sources = {};
    const devices = {};

    (events || []).forEach((ev) => {
      if (ev.event_type === "view") {
        const d = ev.created_at?.slice(0, 10) || "";
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

    const { data: postRows } = await supabase.from("posts").select("id, title, slug").in("id", ids);
    const titleById = Object.fromEntries((postRows || []).map((p) => [p.id, p]));

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
