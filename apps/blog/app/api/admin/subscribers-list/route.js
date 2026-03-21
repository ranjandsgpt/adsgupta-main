import { NextResponse } from "next/server";
import { getUser } from "../../../../lib/auth.js";
import { isPostgresConfigured } from "../../../../lib/cms-runtime.js";
import * as cms from "../../../../lib/cms-pg.js";

export async function GET(request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isPostgresConfigured()) return NextResponse.json({ subscribers: [] });
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;
  try {
    const subscribers = await cms.listSubscribers({ status });
    return NextResponse.json({ subscribers });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}
