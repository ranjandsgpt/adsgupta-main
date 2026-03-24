export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role !== "admin") return forbidden();

  try {
    const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") ?? "200"), 500);
    const result = await sql`
      SELECT
        al.id,
        al.auction_id,
        al.ad_unit_id,
        al.publisher_id,
        al.winning_campaign_id,
        al.winning_creative_id,
        al.winning_bid,
        al.floor_price,
        al.bid_count,
        al.cleared,
        al.page_url,
        al.created_at,
        p.domain AS publisher_domain,
        u.name AS ad_unit_name
      FROM auction_log al
      LEFT JOIN publishers p ON p.id = al.publisher_id
      LEFT JOIN ad_units u ON u.id = al.ad_unit_id
      ORDER BY al.created_at DESC
      LIMIT ${limit}
    `;
    return NextResponse.json(result.rows);
  } catch (e) {
    console.error("[auction-log]", e);
    return NextResponse.json({ error: "Failed to load auction log" }, { status: 500 });
  }
}
