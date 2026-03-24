export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Win notice: `auctionId` is `auction_log.id` (UUID). Legacy: OpenRTB request id stored in `auction_log.auction_id`. */
export async function GET(request: NextRequest) {
  const auctionIdParam = request.nextUrl.searchParams.get("auctionId");
  const priceRaw = request.nextUrl.searchParams.get("price");

  if (!auctionIdParam) {
    return new NextResponse(null, { status: 200 });
  }

  let price: number | null = null;
  if (priceRaw != null && priceRaw !== "") {
    const n = Number(priceRaw);
    price = Number.isFinite(n) ? n : null;
  }

  try {
    type LogRow = {
      id: string;
      auction_id: string;
      cleared: boolean;
      ad_unit_id: string | null;
      winning_campaign_id: string | null;
      winning_creative_id: string | null;
      winning_bid: string | null;
      page_url: string | null;
    };

    let logRes: { rows: LogRow[] };

    if (UUID_RE.test(auctionIdParam)) {
      logRes = await sql<LogRow>`
        SELECT id, auction_id, cleared, ad_unit_id, winning_campaign_id, winning_creative_id, winning_bid::text, page_url
        FROM auction_log
        WHERE id = ${auctionIdParam}
        LIMIT 1
      `;
    } else {
      logRes = await sql<LogRow>`
        SELECT id, auction_id, cleared, ad_unit_id, winning_campaign_id, winning_creative_id, winning_bid::text, page_url
        FROM auction_log
        WHERE auction_id = ${auctionIdParam}
        ORDER BY created_at DESC
        LIMIT 1
      `;
    }

    const row = logRes.rows[0];
    if (!row) {
      return new NextResponse(null, { status: 200 });
    }

    if (row.cleared) {
      return new NextResponse(null, { status: 200 });
    }

    const winningBid = price ?? (row.winning_bid != null ? Number(row.winning_bid) : null);

    await sql`
      UPDATE auction_log
      SET cleared = true,
          winning_bid = COALESCE(${winningBid}, winning_bid)
      WHERE id = ${row.id}
    `;

    if (row.ad_unit_id) {
      await sql`
        INSERT INTO impressions (auction_log_id, auction_id, ad_unit_id, campaign_id, creative_id, winning_bid, page_url)
        SELECT ${row.id}, ${row.auction_id}, ${row.ad_unit_id}, ${row.winning_campaign_id}, ${row.winning_creative_id}, ${winningBid}, ${row.page_url}
        WHERE NOT EXISTS (SELECT 1 FROM impressions WHERE auction_log_id = ${row.id})
      `;
    }

    return new NextResponse(null, { status: 200 });
  } catch (e) {
    console.error("[win]", e);
    return new NextResponse(null, { status: 500 });
  }
}
