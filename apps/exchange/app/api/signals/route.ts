export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const event_type = body.event_type != null ? String(body.event_type) : "";
    const auction_id = body.auction_id != null ? String(body.auction_id) : null;
    const user_id = body.user_id != null ? String(body.user_id) : null;
    const session_id = body.session_id != null ? String(body.session_id) : null;
    const url = body.url != null ? String(body.url) : null;
    const scroll_depth =
      body.scroll_depth != null ? Math.round(Number(body.scroll_depth)) : null;
    const time_on_page_ms =
      body.time_on_page_ms != null ? Math.round(Number(body.time_on_page_ms)) : null;

    if (!event_type) {
      return NextResponse.json({ error: "event_type required" }, { status: 400, headers: CORS });
    }

    let publisherId: string | null = null;
    let adUnitId: string | null = null;
    if (auction_id) {
      const al = await sql<{ publisher_id: string | null; ad_unit_id: string | null }>`
        SELECT publisher_id::text AS publisher_id, ad_unit_id::text AS ad_unit_id
        FROM auction_log
        WHERE auction_id = ${auction_id} OR id::text = ${auction_id}
        LIMIT 1
      `;
      if (al.rows[0]) {
        publisherId = al.rows[0].publisher_id;
        adUnitId = al.rows[0].ad_unit_id;
      }
    }

    await sql`
      INSERT INTO signal_events (
        session_id, user_id, publisher_id, ad_unit_id, event_type,
        url, scroll_depth, time_on_page, raw_signals, auction_id
      )
      VALUES (
        ${session_id},
        ${user_id},
        ${publisherId},
        ${adUnitId},
        ${event_type},
        ${url},
        ${scroll_depth},
        ${time_on_page_ms},
        ${JSON.stringify(body)}::jsonb,
        ${auction_id}
      )
    `;

    if (user_id && scroll_depth != null) {
      void sql`
        UPDATE user_profiles SET last_seen = now(), total_page_views = total_page_views + 1
        WHERE user_id = ${user_id}
      `.catch(() => {});
    }

    return NextResponse.json({ ok: true }, { headers: CORS });
  } catch (e) {
    console.error("[/api/signals]", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false }, { status: 500, headers: CORS });
  }
}
