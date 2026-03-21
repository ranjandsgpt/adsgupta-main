import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { getUser } from "../../../../lib/auth.js";
import { isPostgresConfigured } from "../../../../lib/cms-runtime.js";
import * as cms from "../../../../lib/cms-pg.js";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isPostgresConfigured()) {
    return NextResponse.json({ items: [] });
  }
  try {
    const items = await cms.listMedia(user.email);
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
  if (!isPostgresConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const items = await cms.listMedia(user.email);
    const row = items.find((r) => r.id === id);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (process.env.BLOB_READ_WRITE_TOKEN && row.url?.includes("blob.vercel-storage.com")) {
      try {
        await del(row.url, { token: process.env.BLOB_READ_WRITE_TOKEN });
      } catch {
        /* blob may already be gone */
      }
    }
    await cms.deleteMediaRow(user.email, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Delete failed" }, { status: 500 });
  }
}
