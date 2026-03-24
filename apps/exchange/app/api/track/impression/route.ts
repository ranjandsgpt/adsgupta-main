export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const GIF_1X1 = Buffer.from("R0lGODlhAQABAIABAP///wAAACwAAAAAAQABAAACAkQBADs=", "base64");

/** Record a view from the ad tag pixel: `?id=` = auction_log.id (UUID). Legacy: `?auctionId=` OpenRTB request id. */
export async function GET(request: NextRequest) {
  const logId = request.nextUrl.searchParams.get("id");
  const auctionIdLegacy = request.nextUrl.searchParams.get("auctionId");

  try {
    if (logId) {
      const log = await sql<{
        auction_id: string;
        ad_unit_id: string | null;
        winning_campaign_id: string | null;
        winning_creative_id: string | null;
        winning_bid: string | null;
        page_url: string | null;
      }>`
        SELECT auction_id, ad_unit_id, winning_campaign_id, winning_creative_id, winning_bid::text, page_url
        FROM auction_log
        WHERE id = ${logId}
        LIMIT 1
      `;
      const row = log.rows[0];
      if (row?.ad_unit_id && row.winning_campaign_id && row.winning_creative_id) {
        const exists = await sql<{ c: string }>`
          SELECT COUNT(*)::text AS c FROM impressions WHERE auction_id = ${row.auction_id}
        `;
        if (Number(exists.rows[0]?.c ?? 0) === 0) {
          await sql`
            INSERT INTO impressions (auction_id, ad_unit_id, campaign_id, creative_id, winning_bid, page_url)
            VALUES (${row.auction_id}, ${row.ad_unit_id}, ${row.winning_campaign_id}, ${row.winning_creative_id}, ${row.winning_bid ? Number(row.winning_bid) : null}, ${row.page_url})
          `;
        }
      }
    } else if (auctionIdLegacy) {
      const log = await sql<{
        ad_unit_id: string | null;
        winning_campaign_id: string | null;
        winning_creative_id: string | null;
        winning_bid: string | null;
        page_url: string | null;
      }>`
        SELECT ad_unit_id, winning_campaign_id, winning_creative_id, winning_bid::text, page_url
        FROM auction_log
        WHERE auction_id = ${auctionIdLegacy}
        ORDER BY created_at DESC
        LIMIT 1
      `;
      const row = log.rows[0];
      if (row?.ad_unit_id && row.winning_campaign_id && row.winning_creative_id) {
        const exists = await sql<{ c: string }>`
          SELECT COUNT(*)::text AS c FROM impressions WHERE auction_id = ${auctionIdLegacy}
        `;
        if (Number(exists.rows[0]?.c ?? 0) === 0) {
          await sql`
            INSERT INTO impressions (auction_id, ad_unit_id, campaign_id, creative_id, winning_bid, page_url)
            VALUES (${auctionIdLegacy}, ${row.ad_unit_id}, ${row.winning_campaign_id}, ${row.winning_creative_id}, ${row.winning_bid ? Number(row.winning_bid) : null}, ${row.page_url})
          `;
        }
      }
    }
  } catch (e) {
    console.error("[impression]", e);
  }

  return new NextResponse(GIF_1X1, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store"
    }
  });
}
