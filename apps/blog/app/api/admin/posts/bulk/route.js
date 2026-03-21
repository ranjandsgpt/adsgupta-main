import { NextResponse } from "next/server";
import { getUser } from "../../../../../lib/auth.js";
import { isSupabaseCmsEnabled } from "../../../../../lib/cms-runtime.js";
import { createServerSupabase } from "../../../../../lib/supabase-server.js";
import * as cms from "../../../../../lib/supabase-cms.js";
import { getDatabase } from "../../../../../lib/db.js";

export async function POST(request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { ids, action } = body;
    if (!Array.isArray(ids) || !ids.length || !action) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    if (isSupabaseCmsEnabled()) {
      const supabase = createServerSupabase();
      if (action === "delete") {
        const n = await cms.bulkDelete(supabase, user.id, ids);
        return NextResponse.json({ ok: true, count: n });
      }
      if (action === "publish") {
        const n = await cms.bulkSetStatus(supabase, user.id, ids, "published");
        return NextResponse.json({ ok: true, count: n });
      }
      if (action === "archive") {
        const n = await cms.bulkSetStatus(supabase, user.id, ids, "archived");
        return NextResponse.json({ ok: true, count: n });
      }
      if (action === "draft") {
        const n = await cms.bulkSetStatus(supabase, user.id, ids, "draft");
        return NextResponse.json({ ok: true, count: n });
      }
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    const db = getDatabase();
    let count = 0;
    for (const raw of ids) {
      const id = parseInt(raw, 10);
      if (Number.isNaN(id)) continue;
      if (action === "delete") {
        db.prepare("DELETE FROM posts WHERE id = ?").run(id);
        count++;
      } else if (action === "publish") {
        db.prepare("UPDATE posts SET status = 'published', updated_at = datetime('now') WHERE id = ?").run(id);
        count++;
      } else if (action === "archive") {
        db.prepare("UPDATE posts SET status = 'archived', updated_at = datetime('now') WHERE id = ?").run(id);
        count++;
      } else if (action === "draft") {
        db.prepare("UPDATE posts SET status = 'draft', updated_at = datetime('now') WHERE id = ?").run(id);
        count++;
      }
    }
    return NextResponse.json({ ok: true, count });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Bulk failed" }, { status: 500 });
  }
}
