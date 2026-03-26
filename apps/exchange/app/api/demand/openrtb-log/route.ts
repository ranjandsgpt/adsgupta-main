export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();

  const q = request.nextUrl.searchParams;
  const emailQ = (q.get("email") ?? "").trim().toLowerCase();

  if (auth.role === "advertiser") {
    const allow = (auth.campaignEmail ?? auth.email ?? "").trim().toLowerCase();
    if (!allow || emailQ !== allow) return forbidden();
  } else if (auth.role !== "admin") {
    return forbidden();
  }

  if (!emailQ) return json({ error: "email is required" }, 400);

  try {
    const rows = await sql<{
      id: string;
      auction_id: string;
      created_at: string;
      ad_unit_id: string | null;
      publisher_id: string | null;
      winning_campaign_id: string | null;
      winning_creative_id: string | null;
      winning_bid: string | null;
      floor_price: string | null;
      bid_count: string | null;
      cleared: boolean;
      page_url: string | null;
      country: string | null;
      campaign_name: string | null;
    }>`
      SELECT
        al.id::text,
        al.auction_id,
        al.created_at::text,
        al.ad_unit_id::text,
        al.publisher_id::text,
        al.winning_campaign_id::text,
        al.winning_creative_id::text,
        al.winning_bid::text,
        al.floor_price::text,
        al.bid_count::text,
        al.cleared,
        al.page_url,
        al.country,
        COALESCE(c.campaign_name, c.name) AS campaign_name
      FROM auction_log al
      INNER JOIN campaigns c ON c.id = al.winning_campaign_id
      WHERE COALESCE(c.advertiser_email, c.contact_email) = ${emailQ}
      ORDER BY al.created_at DESC
      LIMIT 200
    `;

    return json({ email: emailQ, rows: rows.rows });
  } catch (e) {
    console.error("[demand/openrtb-log]", e);
    return json({ error: "Failed to load OpenRTB log" }, 500);
  }
}

