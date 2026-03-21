import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getUser } from "../../../../lib/auth.js";
import { isPostgresConfigured } from "../../../../lib/cms-runtime.js";
import * as cms from "../../../../lib/cms-pg.js";

const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isPostgresConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN not configured" }, { status: 503 });
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

  const safeName = String(file.name || "upload").replace(/[^\w.\-]+/g, "_");
  const pathname = `media/${encodeURIComponent(user.email)}/${Date.now()}-${safeName}`;

  const blob = await put(pathname, buf, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
    contentType: file.type || "application/octet-stream",
  });

  const id = await cms.insertMediaRow(user.email, {
    filename: safeName,
    url: blob.url,
    size_bytes: buf.length,
  });

  return NextResponse.json({
    id,
    url: blob.url,
    pathname: blob.pathname,
    filename: safeName,
  });
}
