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
  w?: number;
  h?: number;
};

export type OpenRTBBidRequest = {
  id: string;
  imp: OpenRTBImp[];
  site?: OpenRTBSite;
  device?: OpenRTBDevice;
  at?: number;
  tmax?: number;
};

export type AuctionWinnerPayload = {
  campaignId: string;
  creativeId: string;
  clearingPrice: number;
  imageUrl: string;
  clickUrl: string;
  adm: string;
  w: number;
  h: number;
};

function parseSize(size: string | null | undefined): { w: number; h: number } {
  if (!size) return { w: 300, h: 250 };
  const p = size.split("x");
  const w = Number(p[0]) || 300;
  const h = Number(p[1]) || 250;
  return { w, h };
}

function buildAdm(imageUrl: string, clickUrl: string, w: number, h: number): string {
  return `<a href="${clickUrl.replace(/"/g, "&quot;")}" target="_blank" rel="noopener"><img src="${imageUrl.replace(/"/g, "&quot;")}" width="${w}" height="${h}" border="0" style="display:block"/></a>`;
}

function sizesFromImp(imp: OpenRTBImp | undefined, fallback: string[]): string[] {
  if (!imp?.banner) return fallback;
  if (imp.banner.format?.length) {
    return imp.banner.format.map((f) => `${f.w}x${f.h}`);
  }
  if (imp.banner.w && imp.banner.h) {
    return [`${imp.banner.w}x${imp.banner.h}`];
  }
  return fallback;
}

/**
 * Runs a second-price style auction for one ad unit. Inserts auction_log and returns payload for OpenRTB.
 */
export async function runAuction(
  openrtbRequestId: string,
  adUnitId: string,
  imp: OpenRTBImp | undefined,
  pageUrl: string | null,
  bidfloorFromImp: number
): Promise<{ auctionLogId: string; winner: AuctionWinnerPayload | null } | null> {
  try {
    const unitRes = await sql<{
      id: string;
      publisher_id: string;
      floor_price: string;
      sizes: string[];
      status: string;
      pub_status: string;
    }>`
      SELECT u.id, u.publisher_id, u.floor_price::text, u.sizes, u.status, p.status AS pub_status
      FROM ad_units u
      JOIN publishers p ON p.id = u.publisher_id
      WHERE u.id = ${adUnitId}
      LIMIT 1
    `;
    const adUnit = unitRes.rows[0];
    if (!adUnit) {
      await sql`
        INSERT INTO auction_log
      (auction_id, ad_unit_id, publisher_id, winning_campaign_id, winning_creative_id, winning_bid, floor_price, bid_count, cleared, page_url)
      VALUES
        (${openrtbRequestId}, null, null, null, null, null, ${bidfloorFromImp}, 0, false, ${pageUrl})
      `;
      return null;
    }
    if (adUnit.status !== "active" || adUnit.pub_status !== "active") {
      await sql`
        INSERT INTO auction_log
        (auction_id, ad_unit_id, publisher_id, winning_campaign_id, winning_creative_id, winning_bid, floor_price, bid_count, cleared, page_url)
        VALUES
        (${openrtbRequestId}, ${adUnit.id}, ${adUnit.publisher_id}, null, null, null, ${bidfloorFromImp}, 0, false, ${pageUrl})
      `;
      return null;
    }

    const floor = Math.max(Number(adUnit.floor_price), bidfloorFromImp);

    const candidates = await sql<{
      campaign_id: string;
      creative_id: string;
      bid_price: string;
      image_url: string | null;
      click_url: string | null;
      creative_size: string;
      target_sizes: string[] | null;
    }>`
      SELECT c.id AS campaign_id, cr.id AS creative_id, c.bid_price::text, cr.image_url, cr.click_url,
             cr.size AS creative_size, c.target_sizes
      FROM campaigns c
      INNER JOIN creatives cr ON cr.campaign_id = c.id
      WHERE c.status = 'active'
        AND cr.status = 'active'
        AND cr.image_url IS NOT NULL
        AND cr.click_url IS NOT NULL
      ORDER BY c.bid_price DESC
    `;

    const requestedSizes = sizesFromImp(imp, adUnit.sizes);

    const bids = candidates.rows
      .filter((row) => {
        const bid = Number(row.bid_price);
        if (bid < floor) return false;
        const crSize = row.creative_size;
        if (!crSize) return false;
        if (requestedSizes.includes(crSize)) return true;
        if (row.target_sizes?.includes(crSize)) return true;
        return false;
      })
      .map((row) => ({
        campaignId: row.campaign_id,
        creativeId: row.creative_id,
        bid: Number(row.bid_price),
        imageUrl: row.image_url as string,
        clickUrl: row.click_url as string,
        size: row.creative_size
      }))
      .sort((a, b) => b.bid - a.bid);

    const winner = bids[0] ?? null;
    const second = bids[1];
    const clearingPrice = winner
      ? second
        ? Number(second.bid) + 0.01
        : winner.bid
      : 0;

    const { w, h } = parseSize(winner?.size);

    const insertLog = await sql<{ id: string }>`
      INSERT INTO auction_log
      (auction_id, ad_unit_id, publisher_id, winning_campaign_id, winning_creative_id, winning_bid, floor_price, bid_count, cleared, page_url)
      VALUES
      (
        ${openrtbRequestId},
        ${adUnit.id},
        ${adUnit.publisher_id},
        ${winner?.campaignId ?? null},
        ${winner?.creativeId ?? null},
        ${winner ? clearingPrice : null},
        ${floor},
        ${bids.length},
        false,
        ${pageUrl}
      )
      RETURNING id
    `;

    const auctionLogId = insertLog.rows[0]?.id;
    if (!auctionLogId) {
      return null;
    }

    if (!winner || !winner.imageUrl || !winner.clickUrl) {
      return { auctionLogId, winner: null };
    }

    const adm = buildAdm(winner.imageUrl, winner.clickUrl, w, h);

    return {
      auctionLogId,
      winner: {
        campaignId: winner.campaignId,
        creativeId: winner.creativeId,
        clearingPrice,
        imageUrl: winner.imageUrl,
        clickUrl: winner.clickUrl,
        adm,
        w,
        h
      }
    };
  } catch (e) {
    console.error("[auction-engine] runAuction failed:", e);
    throw e;
  }
}
