import { NextResponse } from "next/server";
import { getUser } from "../../../../lib/auth.js";
import { isPostgresConfigured } from "../../../../lib/cms-runtime.js";
import { sql } from "../../../../lib/db.js";

/** Legacy SQLite monetization API — maps to first active inline ad slot. */
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isPostgresConfigured()) return NextResponse.json([]);
  try {
    const { rows } = await sql`
      SELECT ad_code AS script, placement AS position FROM ad_slots
      WHERE active = true AND placement = 'inline'
      LIMIT 1
    `;
    return NextResponse.json(rows || []);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isPostgresConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  try {
    const body = await request.json();
    const script = body.script || "";
    const position = body.position || "after_paragraph_3";
    const placement = position.includes("header") ? "header" : position.includes("footer") ? "footer" : "inline";

    const { rows: existing } = await sql`
      SELECT id FROM ad_slots WHERE placement = ${placement} LIMIT 1
    `;
    if (existing[0]) {
      await sql`
        UPDATE ad_slots SET ad_code = ${script}, active = true WHERE id = ${existing[0].id}::uuid
      `;
      return NextResponse.json({ success: true, id: existing[0].id });
    }
    const { rows } = await sql`
      INSERT INTO ad_slots (name, placement, ad_code, active)
      VALUES ('Legacy', ${placement}, ${script}, true)
      RETURNING id
    `;
    return NextResponse.json({ success: true, id: rows[0].id });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Failed to save" }, { status: 500 });
  }
}
