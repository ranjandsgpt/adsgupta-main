import { isCampaignOverBudget } from "@/lib/budget-check";
import { sql } from "@/lib/db";
import { campaignMatchesTargeting, openRtbDeviceToLabels } from "@/lib/openrtb-targeting";
import { getEffectiveRuleFloor } from "@/lib/pricing-floor";

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
  publisher?: { id?: string };
};

export type OpenRTBUser = {
  id?: string;
};

export type OpenRTBBidRequest = {
  id: string;
  imp: OpenRTBImp[];
  site?: OpenRTBSite;
  device?: OpenRTBDevice;
  user?: OpenRTBUser;
  at?: number;
  tmax?: number;
};

export type OpenRTBDevice = {
  ua?: string;
  w?: number;
  h?: number;
  devicetype?: number;
  geo?: { country?: string };
};

/** Result after inserting auction_log. `winner` null = no-fill. */
export type RunAuctionOutput = {
  auctionLogId: string;
  winner: {
    /** Same as auctionLogId for headers / tracing */
    auctionId: string;
    winnerId: string;
    creativeId: string;
    clearingPrice: number;
    imageUrl: string;
    clickUrl: string;
    adm: string;
    w: number;
    h: number;
  } | null;
  bidCount: number;
};

function parseSize(size: string | null | undefined): { w: number; h: number } {
  if (!size) return { w: 300, h: 250 };
  const p = size.split("x");
  const w = Number(p[0]) || 300;
  const h = Number(p[1]) || 250;
  return { w, h };
}

function buildAdm(imageUrl: string, clickUrl: string, w: number, h: number): string {
  const href = clickUrl.replace(/"/g, "&quot;");
  const src = imageUrl.replace(/"/g, "&quot;");
  return `<a href='${href}' target='_blank' rel='noopener noreferrer'><img src='${src}' width='${w}' height='${h}' border='0' style='display:block;max-width:100%;'/></a>`;
}

/** Sizes from imp.banner only; if missing, empty (caller may substitute ad unit sizes). */
export function impBannerSizes(imp: OpenRTBImp | undefined): string[] {
  if (!imp?.banner) return [];
  if (imp.banner.format?.length) {
    return imp.banner.format.map((f) => `${f.w}x${f.h}`);
  }
  if (imp.banner.w && imp.banner.h) {
    return [`${imp.banner.w}x${imp.banner.h}`];
  }
  return [];
}

async function insertAuctionLog(args: {
  openrtbRequestId: string;
  adUnitId: string | null;
  publisherId: string | null;
  winnerCampaignId: string | null;
  winnerCreativeId: string | null;
  winningBid: number | null;
  floorPrice: number;
  bidCount: number;
  pageUrl: string | null;
  userAgent?: string | null;
}): Promise<string | null> {
  const ins = await sql<{ id: string }>`
    INSERT INTO auction_log
    (auction_id, ad_unit_id, publisher_id, winning_campaign_id, winning_creative_id, winning_bid, floor_price, bid_count, cleared, page_url, user_agent)
    VALUES
    (
      ${args.openrtbRequestId},
      ${args.adUnitId},
      ${args.publisherId},
      ${args.winnerCampaignId},
      ${args.winnerCreativeId},
      ${args.winningBid},
      ${args.floorPrice},
      ${args.bidCount},
      false,
      ${args.pageUrl},
      ${args.userAgent ?? null}
    )
    RETURNING id
  `;
  return ins.rows[0]?.id ?? null;
}

type EligibleBid = {
  campaignId: string;
  creativeId: string;
  bidPrice: number;
  imageUrl: string;
  clickUrl: string;
  size: string;
};

/**
 * Production auction: publisher + ad unit gates, date window, daily budget, size match on imp banner (fallback ad unit sizes), second price.
 */
function normalizePubDomain(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let s = raw.trim().toLowerCase().replace(/^https?:\/\//, "");
  s = (s.split("/")[0] ?? "").split(":")[0] ?? "";
  s = s.replace(/^www\./, "");
  return s || null;
}

export async function runAuction(
  openrtbRequestId: string,
  adUnitId: string,
  imp: OpenRTBImp | undefined,
  pageUrl: string | null,
  bidfloorFromImp: number,
  opts?: { site?: OpenRTBSite; device?: OpenRTBDevice }
): Promise<RunAuctionOutput | null> {
  try {
    const unitRes = await sql<{
      id: string;
      publisher_id: string;
      floor_price: string;
      sizes: string[];
      unit_status: string;
      pub_status: string;
      environment: string;
      publisher_domain: string;
    }>`
      SELECT u.id, u.publisher_id, u.floor_price::text, u.sizes, u.status AS unit_status, p.status AS pub_status,
        u.environment, p.domain AS publisher_domain
      FROM ad_units u
      INNER JOIN publishers p ON p.id = u.publisher_id
      WHERE u.id = ${adUnitId}
      LIMIT 1
    `;
    const adUnit = unitRes.rows[0];
    const ua = opts?.device?.ua ? String(opts.device.ua).slice(0, 2000) : null;

    if (!adUnit) {
      const id = await insertAuctionLog({
        openrtbRequestId,
        adUnitId: null,
        publisherId: null,
        winnerCampaignId: null,
        winnerCreativeId: null,
        winningBid: null,
        floorPrice: bidfloorFromImp,
        bidCount: 0,
        pageUrl,
        userAgent: ua
      });
      if (id) console.log("[auction]", id, "bids:", 0, "winner:", "none", "price:", "-");
      return id ? { auctionLogId: id, winner: null, bidCount: 0 } : null;
    }

    const ruleFloor = await getEffectiveRuleFloor(adUnit.sizes ?? [], adUnit.environment ?? "web");
    const floor = Math.max(Number(adUnit.floor_price), bidfloorFromImp, ruleFloor);

    if (adUnit.pub_status !== "active") {
      const id = await insertAuctionLog({
        openrtbRequestId,
        adUnitId: adUnit.id,
        publisherId: adUnit.publisher_id,
        winnerCampaignId: null,
        winnerCreativeId: null,
        winningBid: null,
        floorPrice: floor,
        bidCount: 0,
        pageUrl,
        userAgent: ua
      });
      if (id) console.log("[auction]", id, "bids:", 0, "winner:", "none", "price:", "-");
      return id ? { auctionLogId: id, winner: null, bidCount: 0 } : null;
    }

    if (adUnit.unit_status !== "active") {
      const id = await insertAuctionLog({
        openrtbRequestId,
        adUnitId: adUnit.id,
        publisherId: adUnit.publisher_id,
        winnerCampaignId: null,
        winnerCreativeId: null,
        winningBid: null,
        floorPrice: floor,
        bidCount: 0,
        pageUrl,
        userAgent: ua
      });
      if (id) console.log("[auction]", id, "bids:", 0, "winner:", "none", "price:", "-");
      return id ? { auctionLogId: id, winner: null, bidCount: 0 } : null;
    }

    let formatSizes = impBannerSizes(imp);
    if (formatSizes.length === 0) {
      formatSizes = adUnit.sizes ?? [];
    }

    const siteDom = normalizePubDomain(opts?.site?.domain);
    const pubDom = normalizePubDomain(adUnit.publisher_domain);
    const deviceCountry = opts?.device?.geo?.country?.trim().toUpperCase() ?? null;
    const deviceLabels = openRtbDeviceToLabels(opts?.device?.devicetype);
    const targetingCtx = {
      formatSizes,
      publisherDomain: pubDom ?? siteDom,
      adUnitEnvironment: adUnit.environment ?? null,
      deviceCountry,
      deviceLabels
    };

    const campaignsRes = await sql<{
      id: string;
      bid_price: string;
      daily_budget: string | null;
      target_sizes: string[] | null;
      target_environments: string[] | null;
      target_domains: string[] | null;
      target_geos: string[] | null;
      target_devices: string[] | null;
    }>`
      SELECT id, bid_price::text, daily_budget::text, target_sizes, target_environments, target_domains, target_geos, target_devices
      FROM campaigns
      WHERE status = 'active'
        AND (start_date IS NULL OR start_date <= CURRENT_DATE)
        AND (end_date IS NULL OR end_date >= CURRENT_DATE)
    `;

    const eligibleCampaignIds: string[] = [];
    for (const c of campaignsRes.rows) {
      if (!campaignMatchesTargeting(c, targetingCtx)) continue;
      const budget = c.daily_budget != null ? Number(c.daily_budget) : NaN;
      if (!Number.isNaN(budget) && budget > 0) {
        if (await isCampaignOverBudget(c.id, budget)) continue;
      }
      eligibleCampaignIds.push(c.id);
    }

    if (eligibleCampaignIds.length === 0) {
      const id = await insertAuctionLog({
        openrtbRequestId,
        adUnitId: adUnit.id,
        publisherId: adUnit.publisher_id,
        winnerCampaignId: null,
        winnerCreativeId: null,
        winningBid: null,
        floorPrice: floor,
        bidCount: 0,
        pageUrl,
        userAgent: ua
      });
      if (id) console.log("[auction]", id, "bids:", 0, "winner:", "none", "price:", "-");
      return id ? { auctionLogId: id, winner: null, bidCount: 0 } : null;
    }

    const creativeRows: Array<{
      campaign_id: string;
      creative_id: string;
      bid_price: string;
      image_url: string | null;
      click_url: string | null;
      creative_size: string;
    }> = [];

    for (const cid of eligibleCampaignIds) {
      const crRes = await sql<{
        campaign_id: string;
        creative_id: string;
        bid_price: string;
        image_url: string | null;
        click_url: string | null;
        creative_size: string;
      }>`
        SELECT c.id AS campaign_id, cr.id AS creative_id, c.bid_price::text, cr.image_url, cr.click_url, cr.size AS creative_size
        FROM campaigns c
        INNER JOIN creatives cr ON cr.campaign_id = c.id
        WHERE c.id = ${cid}
          AND cr.status = 'active'
          AND cr.image_url IS NOT NULL
          AND cr.click_url IS NOT NULL
      `;
      creativeRows.push(...crRes.rows);
    }

    const eligible: EligibleBid[] = [];
    for (const r of creativeRows) {
      const bidPrice = Number(r.bid_price);
      if (bidPrice < floor) continue;
      const crSize = r.creative_size;
      if (!crSize || !formatSizes.includes(crSize)) continue;
      eligible.push({
        campaignId: r.campaign_id,
        creativeId: r.creative_id,
        bidPrice,
        imageUrl: r.image_url as string,
        clickUrl: r.click_url as string,
        size: crSize
      });
    }

    eligible.sort((a, b) => b.bidPrice - a.bidPrice);

    if (eligible.length === 0) {
      const id = await insertAuctionLog({
        openrtbRequestId,
        adUnitId: adUnit.id,
        publisherId: adUnit.publisher_id,
        winnerCampaignId: null,
        winnerCreativeId: null,
        winningBid: null,
        floorPrice: floor,
        bidCount: 0,
        pageUrl,
        userAgent: ua
      });
      if (id) console.log("[auction]", id, "bids:", 0, "winner:", "none", "price:", "-");
      return id ? { auctionLogId: id, winner: null, bidCount: 0 } : null;
    }

    const winner = eligible[0];
    const second = eligible[1];
    const clearingPrice = second ? second.bidPrice + 0.01 : winner.bidPrice;
    const { w, h } = parseSize(winner.size);
    const adm = buildAdm(winner.imageUrl, winner.clickUrl, w, h);

    const auctionLogId = await insertAuctionLog({
      openrtbRequestId,
      adUnitId: adUnit.id,
      publisherId: adUnit.publisher_id,
      winnerCampaignId: winner.campaignId,
      winnerCreativeId: winner.creativeId,
      winningBid: clearingPrice,
      floorPrice: floor,
      bidCount: eligible.length,
      pageUrl,
      userAgent: ua
    });

    if (!auctionLogId) return null;

    console.log("[auction]", auctionLogId, "bids:", eligible.length, "winner:", winner.campaignId, "price:", clearingPrice);

    return {
      auctionLogId,
      bidCount: eligible.length,
      winner: {
        auctionId: auctionLogId,
        winnerId: winner.campaignId,
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
