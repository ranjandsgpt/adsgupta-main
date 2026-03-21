import { NextResponse } from "next/server";
import { getUser } from "../../../../lib/auth.js";
import { isSupabaseCmsEnabled } from "../../../../lib/cms-runtime.js";
import { createServerSupabase } from "../../../../lib/supabase-server.js";
import * as cms from "../../../../lib/supabase-cms.js";

const BUCKET = "blog-media";

function storagePathFromPublicUrl(url) {
  if (!url || typeof url !== "string") return null;
  const marker = `/object/public/${BUCKET}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;
  return decodeURIComponent(url.slice(i + marker.length));
}

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSupabaseCmsEnabled()) {
    return NextResponse.json({ items: [] });
  }
  try {
    const supabase = createServerSupabase();
    const items = await cms.listMedia(supabase, user.id);
    return NextResponse.json({ items });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}

export async function DELETE(request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  if (!isSupabaseCmsEnabled()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  try {
    const supabase = createServerSupabase();
    const items = await cms.listMedia(supabase, user.id);
    const row = items.find((r) => r.id === id);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const path = storagePathFromPublicUrl(row.url);
    if (path) {
      await supabase.storage.from(BUCKET).remove([path]);
    }
    await cms.deleteMediaRow(supabase, user.id, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Delete failed" }, { status: 500 });
  }
}
