export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest, NextResponse } from "next/server";

function escCsv(v: unknown): string {
  const s = v == null ? "" : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role !== "admin") return forbidden();

  const sp = request.nextUrl.searchParams;
  const limit = Math.min(Number(sp.get("limit") ?? "200"), 2000);
  const publisherId = sp.get("publisherId") ?? sp.get("publisher_id");
  const clearedParam = sp.get("cleared") ?? "all";
  const dateFrom = sp.get("dateFrom") ?? sp.get("from");
  const dateTo = sp.get("dateTo") ?? sp.get("to");
  const preset = sp.get("preset");
  const format = sp.get("format");

  let fromD = dateFrom;
  let toD = dateTo;
  if (preset === "today") {
    fromD = new Date().toISOString().slice(0, 10);
    toD = fromD;
  } else if (preset === "yesterday") {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    fromD = d.toISOString().slice(0, 10);
    toD = fromD;
  } else if (preset === "7d") {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    fromD = d.toISOString().slice(0, 10);
    toD = new Date().toISOString().slice(0, 10);
  }
  if (!fromD) fromD = "1970-01-01";
  if (!toD) toD = "2099-12-31";

  const clearedFilter = clearedParam === "cleared" ? "true" : clearedParam === "no_fill" ? "false" : clearedParam;

  try {
    const rows =
      clearedFilter === "true"
        ? await sql`
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
              al.user_agent,
              al.created_at,
              p.domain AS publisher_domain,
              u.name AS ad_unit_name,
              cr.image_url AS creative_image_url
            FROM auction_log al
            LEFT JOIN publishers p ON p.id = al.publisher_id
            LEFT JOIN ad_units u ON u.id = al.ad_unit_id
            LEFT JOIN creatives cr ON cr.id = al.winning_creative_id
            WHERE al.created_at::date >= ${fromD}::date
              AND al.created_at::date <= ${toD}::date
              AND al.cleared = true
              AND (${publisherId}::text IS NULL OR ${publisherId}::text = '' OR al.publisher_id = ${publisherId}::uuid)
            ORDER BY al.created_at DESC
            LIMIT ${limit}
          `
        : clearedFilter === "false"
          ? await sql`
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
                al.user_agent,
                al.created_at,
                p.domain AS publisher_domain,
                u.name AS ad_unit_name,
                cr.image_url AS creative_image_url
              FROM auction_log al
              LEFT JOIN publishers p ON p.id = al.publisher_id
              LEFT JOIN ad_units u ON u.id = al.ad_unit_id
              LEFT JOIN creatives cr ON cr.id = al.winning_creative_id
              WHERE al.created_at::date >= ${fromD}::date
                AND al.created_at::date <= ${toD}::date
                AND al.cleared = false
                AND (${publisherId}::text IS NULL OR ${publisherId}::text = '' OR al.publisher_id = ${publisherId}::uuid)
              ORDER BY al.created_at DESC
              LIMIT ${limit}
            `
          : await sql`
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
                al.user_agent,
                al.created_at,
                p.domain AS publisher_domain,
                u.name AS ad_unit_name,
                cr.image_url AS creative_image_url
              FROM auction_log al
              LEFT JOIN publishers p ON p.id = al.publisher_id
              LEFT JOIN ad_units u ON u.id = al.ad_unit_id
              LEFT JOIN creatives cr ON cr.id = al.winning_creative_id
              WHERE al.created_at::date >= ${fromD}::date
                AND al.created_at::date <= ${toD}::date
                AND (${publisherId}::text IS NULL OR ${publisherId}::text = '' OR al.publisher_id = ${publisherId}::uuid)
              ORDER BY al.created_at DESC
              LIMIT ${limit}
            `;

    if (format === "csv") {
      const header = [
        "id",
        "created_at",
        "auction_id",
        "publisher_domain",
        "ad_unit_name",
        "page_url",
        "bid_count",
        "winning_bid",
        "floor_price",
        "cleared",
        "user_agent"
      ];
      const lines = [header.join(",")];
      for (const r of rows.rows as Record<string, unknown>[]) {
        lines.push(
          [
            escCsv(r.id),
            escCsv(r.created_at),
            escCsv(r.auction_id),
            escCsv(r.publisher_domain),
            escCsv(r.ad_unit_name),
            escCsv(r.page_url),
            escCsv(r.bid_count),
            escCsv(r.winning_bid),
            escCsv(r.floor_price),
            escCsv(r.cleared),
            escCsv(r.user_agent)
          ].join(",")
        );
      }
      return new NextResponse(lines.join("\n"), {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="auction-log.csv"'
        }
      });
    }

    return NextResponse.json(rows.rows);
  } catch (e) {
    console.error("[auction-log]", e);
    return NextResponse.json({ error: "Failed to load auction log" }, { status: 500 });
  }
}
