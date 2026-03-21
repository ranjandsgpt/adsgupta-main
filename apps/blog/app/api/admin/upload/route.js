import { NextResponse } from "next/server";
import { getUser } from "../../../../lib/auth.js";
import { isSupabaseCmsEnabled } from "../../../../lib/cms-runtime.js";
import { createServerSupabase } from "../../../../lib/supabase-server.js";
import * as cms from "../../../../lib/supabase-cms.js";

const BUCKET = "blog-media";
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSupabaseCmsEnabled()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!file || typeof file.arrayBuffer !== "function") {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 8MB)" }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const safeName = String(file.name || "upload").replace(/[^\w.\-]+/g, "_");
  const path = `${user.id}/${Date.now()}-${safeName}`;

  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, buf, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (upErr) {
    return NextResponse.json({ error: upErr.message || "Upload failed" }, { status: 500 });
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const publicUrl = pub?.publicUrl;

  try {
    await cms.insertMediaRow(supabase, user.id, {
      filename: safeName,
      url: publicUrl,
      size_bytes: buf.length,
    });
  } catch {
    // media row optional if table policy blocks
  }

  return NextResponse.json({ url: publicUrl, path });
}
