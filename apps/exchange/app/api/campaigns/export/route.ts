export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase() ?? "";
  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  const result = await sql`
    SELECT
      c.*,
      (SELECT COUNT(*)::int FROM impressions i WHERE i.campaign_id = c.id) AS impressions_total,
      (SELECT COALESCE(SUM(i.winning_bid),0)/1000 FROM impressions i WHERE i.campaign_id = c.id)::text AS revenue_total
    FROM campaigns c
    WHERE COALESCE(c.advertiser_email, c.contact_email) = ${email}
    ORDER BY c.created_at DESC
  `;

  const headers = [
    "id",
    "campaign_name",
    "advertiser_name",
    "advertiser_email",
    "bid_price",
    "daily_budget",
    "status",
    "target_sizes",
    "impressions_total",
    "revenue_total"
  ];
  const lines = [headers.join(",")];
  for (const r of result.rows as Record<string, unknown>[]) {
    const row = [
      r.id,
      r.campaign_name ?? r.name,
      r.advertiser_name ?? r.advertiser,
      r.advertiser_email ?? r.contact_email,
      r.bid_price,
      r.daily_budget,
      r.status,
      Array.isArray(r.target_sizes) ? (r.target_sizes as string[]).join("|") : "",
      r.impressions_total,
      r.revenue_total
    ].map((x) => `"${String(x ?? "").replace(/"/g, '""')}"`);
    lines.push(row.join(","));
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="campaigns-${email.replace(/@/g, "_at_")}.csv"`
    }
  });
}
