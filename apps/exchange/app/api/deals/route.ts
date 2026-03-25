export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth || auth.role !== "admin") return auth ? forbidden() : unauthorized();
  try {
    const r = await sql`SELECT * FROM deals ORDER BY created_at DESC NULLS LAST LIMIT 500`;
    return NextResponse.json(r.rows);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth || auth.role !== "admin") return auth ? forbidden() : unauthorized();
  try {
    const body = await request.json();
    const dealId = String(body.deal_id ?? `deal-${Date.now()}`);
    const name = String(body.name ?? "Deal");
    const type = String(body.type ?? "private_auction");
    const r = await sql`
      INSERT INTO deals (deal_id, name, type, status, publisher_id, floor_cpm, fixed_cpm)
      VALUES (
        ${dealId},
        ${name},
        ${type},
        ${body.status ?? "pending"},
        ${body.publisher_id ?? null},
        ${body.floor_cpm ?? null},
        ${body.fixed_cpm ?? null}
      )
      RETURNING *
    `;
    return NextResponse.json(r.rows[0], { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
