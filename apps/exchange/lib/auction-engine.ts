import { sql } from "@/lib/db";

export type OpenRTBBanner = {
  w?: number;
  h?: number;
  format?: Array<{ w: number; h: number }>;
};

export type OpenRTBImp = {
  id: string;
  tagid?: string;
  banner?: OpenRTBBanner;
  bidfloor?: number;
};

export type OpenRTBSite = {
  domain?: string;
  page?: string;
};

export type OpenRTBDevice = {
  ua?: string;
  geo?: { country?: string };
};

export type OpenRTBBidRequest = {
  id: string;
  imp: OpenRTBImp[];
  site?: OpenRTBSite;
  device?: OpenRTBDevice;
};

export type OpenRTBBid = {
  id: string;
  impid: string;
  price: number;
  crid: string;
  adid: string;
  adm: string;
  nurl: string;
};

export type OpenRTBBidResponse = {
  id: string;
  seatbid: Array<{ bid: OpenRTBBid[] }>;
  cur: string;
};

type AuctionResult = {
  winner: { campaignId: string; creativeId: string; bid: number } | null;
  creative: { html_snippet: string | null; image_url: string | null; click_url: string | null } | null;
  clearingPrice: number;
  bidCount: number;
};

export async function runAuction(request: OpenRTBBidRequest): Promise<AuctionResult> {
  const imp = request.imp[0];
  const adUnitId = imp?.tagid;
  if (!adUnitId) {
    return { winner: null, creative: null, clearingPrice: 0, bidCount: 0 };
  }

  const adUnitRes = await sql<{
    id: string;
    publisher_id: string;
    floor_price: string;
    ad_type: string;
    sizes: string[];
  }>`SELECT id, publisher_id, floor_price, ad_type, sizes FROM ad_units WHERE id = ${adUnitId} LIMIT 1`;
  const adUnit = adUnitRes.rows[0];
  if (!adUnit) {
    return { winner: null, creative: null, clearingPrice: 0, bidCount: 0 };
  }

  const requestedSizes =
    imp.banner?.format?.map((f) => `${f.w}x${f.h}`) ??
    (imp.banner?.w && imp.banner?.h ? [`${imp.banner.w}x${imp.banner.h}`] : adUnit.sizes);
  const floor = Math.max(Number(adUnit.floor_price), imp.bidfloor ?? 0);

  const candidates = await sql<{
    campaign_id: string;
    creative_id: string;
    bid_price: string;
    html_snippet: string | null;
    image_url: string | null;
    click_url: string | null;
  }>`
    SELECT c.id AS campaign_id, cr.id AS creative_id, c.bid_price, cr.html_snippet, cr.image_url, cr.click_url
    FROM campaigns c
    JOIN creatives cr ON cr.campaign_id = c.id
    WHERE c.status = 'active'
      AND cr.status = 'active'
      AND (cr.size IS NULL OR cr.size = ${requestedSizes[0] ?? null})
    ORDER BY c.bid_price DESC
  `;

  const bids = candidates.rows
    .map((row) => ({
      campaignId: row.campaign_id,
      creativeId: row.creative_id,
      bid: Number(row.bid_price),
      creative: {
        html_snippet: row.html_snippet,
        image_url: row.image_url,
        click_url: row.click_url
      }
    }))
    .filter((row) => row.bid >= floor)
    .sort((a, b) => b.bid - a.bid);

  const winner = bids[0] ?? null;
  const second = bids[1];
  const clearingPrice = winner ? Math.min(winner.bid, (second?.bid ?? floor) + 0.01) : 0;

  await sql`
    INSERT INTO auction_log
    (auction_id, ad_unit_id, publisher_id, winning_campaign_id, winning_creative_id, winning_bid, floor_price, bid_count, cleared, user_agent, country, page_url)
    VALUES
    (
      ${request.id},
      ${adUnit.id},
      ${adUnit.publisher_id},
      ${winner?.campaignId ?? null},
      ${winner?.creativeId ?? null},
      ${winner?.bid ?? null},
      ${floor},
      ${bids.length},
      false,
      ${request.device?.ua ?? null},
      ${request.device?.geo?.country ?? null},
      ${request.site?.page ?? null}
    )
  `;

  return {
    winner: winner ? { campaignId: winner.campaignId, creativeId: winner.creativeId, bid: winner.bid } : null,
    creative: winner ? winner.creative : null,
    clearingPrice,
    bidCount: bids.length
  };
}
