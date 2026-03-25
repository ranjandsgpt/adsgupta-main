export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest, NextResponse } from "next/server";

async function segmentReachCount(): Promise<number> {
  const r = await sql<{ c: string }>`SELECT COUNT(*)::text AS c FROM user_profiles`;
  return Number(r.rows[0]?.c ?? 0);
}

export async function POST(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth || auth.role !== "admin") return auth ? forbidden() : unauthorized();
  const body = await request.json();
  if (!body.name || !body.type || body.rules == null) {
    return NextResponse.json({ error: "name, type, rules required" }, { status: 400 });
  }
  const rules = typeof body.rules === "object" ? body.rules : {};
  const userCount = await segmentReachCount();
  const r = await sql`
    INSERT INTO audience_segments (name, description, type, rules, publisher_id, is_public, user_count)
    VALUES (
      ${String(body.name)},
      ${body.description != null ? String(body.description) : null},
      ${String(body.type)},
      ${JSON.stringify(rules)}::jsonb,
      ${body.publisher_id ?? null},
      ${Boolean(body.is_public)},
      ${userCount}
    )
    RETURNING *
  `;
  const seg = r.rows[0];
  if (seg?.id) {
    void (async () => {
      try {
        const c = await sql<{ c: string }>`
          SELECT COUNT(*)::text AS c FROM segment_memberships WHERE segment_id = ${String(seg.id)}::uuid
        `;
        await sql`UPDATE audience_segments SET user_count = ${Number(c.rows[0]?.c ?? 0)} WHERE id = ${String(seg.id)}::uuid`;
      } catch (e) {
        console.error("[segment/populate]", e instanceof Error ? e.message : e);
      }
    })();
  }
  return NextResponse.json({ ...seg, user_count: userCount }, { status: 201 });
}
