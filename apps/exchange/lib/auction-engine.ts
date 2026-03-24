import { isCampaignOverBudget } from "@/lib/budget-check";
import { requestAllDspBids, type DspBid } from "@/lib/dsp-bidder";
import { sql } from "@/lib/db";
import { getEffectiveFloor } from "@/lib/floor-engine";
import type {
  OpenRTB26App,
  OpenRTB26BidRequest,
  OpenRTB26Device,
  OpenRTB26Imp,
  OpenRTB26Site,
  OpenRTB26User
} from "@/lib/openrtb-types";
import { campaignMatchesTargeting, openRtbDeviceToLabels } from "@/lib/openrtb-targeting";

export type OpenRTBBanner = {
  w?: number;
  h?: number;
  format?: Array<{ w: number; h: number }>;
};

export type OpenRTBImp = OpenRTB26Imp;

export type OpenRTBSite = OpenRTB26Site;

export type OpenRTBUser = OpenRTB26User;

export type OpenRTBBidRequest = OpenRTB26BidRequest;

export type OpenRTBDevice = OpenRTB26Device;

export type AuctionEngineOpts = {
  site?: OpenRTB26Site;
  app?: OpenRTB26App;
  device?: OpenRTB26Device;
  user?: OpenRTB26User;
  /** Full OpenRTB request (for DSP clone, regs, bcat, badv) */
  fullRequest?: OpenRTB26BidRequest;
  ipForLog?: string | null;
};

/** Result after inserting auction_log. `winner` null = no-fill. */
export type RunAuctionOutput = {
  auctionLogId: string;
  winner: {
    auctionId: string;
    winnerId: string;
    creativeId: string;
    clearingPrice: number;
    imageUrl: string;
    clickUrl: string;
    adm: string;
    w: number;
    h: number;
    adomain?: string[];
    iurl?: string;
    cid?: string;
    crid?: string;
    cat?: string[];
    cattax?: number;
    api?: number[];
    demandSource: string;
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

function normHost(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let s = raw.trim().toLowerCase().replace(/^https?:\/\//, "");
  s = (s.split("/")[0] ?? "").split(":")[0] ?? "";
  s = s.replace(/^www\./, "");
  return s || null;
}

function campaignBlockedByBcat(
  campaignCats: string[] | null | undefined,
  bcat: string[] | null | undefined
): boolean {
  if (!bcat?.length || !campaignCats?.length) return false;
  const blocked = new Set(bcat.map((x) => String(x).trim()));
  return campaignCats.some((c) => blocked.has(String(c).trim()));
}

function campaignBlockedByBadv(
  advertiserDomain: string | null | undefined,
  badv: string[] | null | undefined
): boolean {
  if (!badv?.length) return false;
  const dom = normHost(advertiserDomain);
  if (!dom) return false;
  const blocked = new Set(badv.map((x) => normHost(String(x))!).filter(Boolean));
  return blocked.has(dom);
}

function urlsSecureEnough(imageUrl: string, clickUrl: string): boolean {
  return imageUrl.startsWith("https:") && clickUrl.startsWith("https:");
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
  demandSource?: string | null;
  deviceIp?: string | null;
}): Promise<string | null> {
  const ins = await sql<{ id: string }>`
    INSERT INTO auction_log
    (auction_id, ad_unit_id, publisher_id, winning_campaign_id, winning_creative_id, winning_bid, floor_price, bid_count, cleared, page_url, user_agent, demand_source, device_ip)
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
      ${args.userAgent ?? null},
      ${args.demandSource ?? "internal"},
      ${args.deviceIp ?? null}
    )
    RETURNING id
  `;
  return ins.rows[0]?.id ?? null;
}

type InternalBid = {
  campaignId: string;
  creativeId: string;
  bidPrice: number;
  imageUrl: string;
  clickUrl: string;
  size: string;
  advertiserDomain: string | null;
  iabCat: string[] | null;
  creativeApi: number[] | null;
};

type DspPoolBid = {
  kind: "dsp";
  dspBid: DspBid;
  bidPrice: number;
};

type InternalPoolEntry = InternalBid & { kind: "internal" };
type PoolBid = InternalPoolEntry | DspPoolBid;

function normalizePubDomain(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let s = raw.trim().toLowerCase().replace(/^https?:\/\//, "");
  s = (s.split("/")[0] ?? "").split(":")[0] ?? "";
  s = s.replace(/^www\./, "");
  return s || null;
}

/**
 * Production auction: gates, floor engine, internal + DSP bids, OpenRTB auction type (1/2).
 */
export async function runAuction(
  openrtbRequestId: string,
  adUnitId: string,
  imp: OpenRTBImp | undefined,
  pageUrl: string | null,
  bidfloorFromImp: number,
  opts?: AuctionEngineOpts
): Promise<RunAuctionOutput | null> {
  try {
    const regs = opts?.fullRequest?.regs;
    const userConsent = opts?.fullRequest?.user?.consent?.trim();
    if (regs?.gdpr === 1 && !userConsent) {
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
        userAgent: opts?.device?.ua ? String(opts.device.ua).slice(0, 2000) : null,
        demandSource: null,
        deviceIp: opts?.ipForLog ?? opts?.device?.ip ?? null
      });
      if (id) console.log("[auction]", id, "gdpr: no consent — no fill");
      return id ? { auctionLogId: id, winner: null, bidCount: 0 } : null;
    }

    const unitRes = await sql<{
      id: string;
      publisher_id: string;
      floor_price: string;
      sizes: string[];
      unit_status: string;
      pub_status: string;
      environment: string;
      publisher_domain: string;
      ad_type: string;
    }>`
      SELECT u.id, u.publisher_id, u.floor_price::text, u.sizes, u.status AS unit_status, p.status AS pub_status,
        u.environment, p.domain AS publisher_domain, u.ad_type
      FROM ad_units u
      INNER JOIN publishers p ON p.id = u.publisher_id
      WHERE u.id = ${adUnitId}
      LIMIT 1
    `;
    const adUnit = unitRes.rows[0];
    const ua = opts?.device?.ua ? String(opts.device.ua).slice(0, 2000) : null;
    const devIp = opts?.ipForLog ?? opts?.device?.ip ?? null;
    if (devIp) console.log("[openrtb] device.ip (log):", devIp);

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
        userAgent: ua,
        deviceIp: devIp
      });
      if (id) console.log("[auction]", id, "bids:", 0, "winner:", "none", "price:", "-");
      return id ? { auctionLogId: id, winner: null, bidCount: 0 } : null;
    }

    let formatSizes = impBannerSizes(imp);
    if (formatSizes.length === 0) {
      formatSizes = adUnit.sizes ?? [];
    }

    const baseFloor = await getEffectiveFloor({
      adUnitId: adUnit.id,
      publisherId: adUnit.publisher_id,
      sizes: formatSizes,
      adType: adUnit.ad_type ?? "display",
      environment: adUnit.environment ?? "web",
      pageUrl: pageUrl ?? "",
      country: opts?.device?.geo?.country
    });
    const impFloor = imp?.bidfloor != null ? Number(imp.bidfloor) : 0;
    const floor = Math.max(baseFloor, bidfloorFromImp, Number.isFinite(impFloor) ? impFloor : 0);

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
        userAgent: ua,
        deviceIp: devIp
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
        userAgent: ua,
        deviceIp: devIp
      });
      if (id) console.log("[auction]", id, "bids:", 0, "winner:", "none", "price:", "-");
      return id ? { auctionLogId: id, winner: null, bidCount: 0 } : null;
    }

    const siteDom = normalizePubDomain(opts?.site?.domain ?? opts?.app?.domain);
    const pubDom = normalizePubDomain(adUnit.publisher_domain);
    let deviceCountry = opts?.device?.geo?.country?.trim().toUpperCase() ?? null;
    if (regs?.coppa === 1) {
      deviceCountry = null;
    }
    const deviceLabels = openRtbDeviceToLabels(opts?.device?.devicetype);
    const targetingCtx = {
      formatSizes,
      publisherDomain: pubDom ?? siteDom,
      adUnitEnvironment: adUnit.environment ?? null,
      deviceCountry,
      deviceLabels
    };

    const bcat = opts?.fullRequest?.bcat;
    const badv = opts?.fullRequest?.badv;
    const requireSecure = imp?.secure === 1;

    const campaignsRes = await sql<{
      id: string;
      bid_price: string;
      daily_budget: string | null;
      target_sizes: string[] | null;
      target_environments: string[] | null;
      target_domains: string[] | null;
      target_geos: string[] | null;
      target_devices: string[] | null;
      advertiser_domain: string | null;
      advertiser_name: string | null;
      iab_cat: string[] | null;
      creative_api: number[] | null;
    }>`
      SELECT id, bid_price::text, daily_budget::text, target_sizes, target_environments, target_domains, target_geos, target_devices,
        advertiser_domain, COALESCE(advertiser_name, advertiser) AS advertiser_name, iab_cat, creative_api
      FROM campaigns
      WHERE status = 'active'
        AND (start_date IS NULL OR start_date <= CURRENT_DATE)
        AND (end_date IS NULL OR end_date >= CURRENT_DATE)
    `;

    const eligibleCampaignIds: string[] = [];
    for (const c of campaignsRes.rows) {
      if (regs?.coppa === 1 && c.target_geos && c.target_geos.length > 0) continue;
      if (campaignBlockedByBcat(c.iab_cat, bcat)) continue;
      const advDom = c.advertiser_domain ?? null;
      if (advDom && campaignBlockedByBadv(advDom, badv)) continue;
      if (!campaignMatchesTargeting(c, targetingCtx)) continue;
      const budget = c.daily_budget != null ? Number(c.daily_budget) : NaN;
      if (!Number.isNaN(budget) && budget > 0) {
        if (await isCampaignOverBudget(c.id, budget)) continue;
      }
      eligibleCampaignIds.push(c.id);
    }

    const internalPool: InternalBid[] = [];

    if (eligibleCampaignIds.length > 0) {
      const creativeRows: Array<{
        campaign_id: string;
        creative_id: string;
        bid_price: string;
        image_url: string | null;
        click_url: string | null;
        creative_size: string;
        advertiser_domain: string | null;
        advertiser_name: string | null;
        iab_cat: string[] | null;
        creative_api: number[] | null;
      }> = [];

      for (const cid of eligibleCampaignIds) {
        const crRes = await sql<{
          campaign_id: string;
          creative_id: string;
          bid_price: string;
          image_url: string | null;
          click_url: string | null;
          creative_size: string;
          advertiser_domain: string | null;
          advertiser_name: string | null;
          iab_cat: string[] | null;
          creative_api: number[] | null;
        }>`
          SELECT c.id AS campaign_id, cr.id AS creative_id, c.bid_price::text, cr.image_url, cr.click_url, cr.size AS creative_size,
            c.advertiser_domain, COALESCE(c.advertiser_name, c.advertiser) AS advertiser_name, c.iab_cat, c.creative_api
          FROM campaigns c
          INNER JOIN creatives cr ON cr.campaign_id = c.id
          WHERE c.id = ${cid}
            AND cr.status = 'active'
            AND cr.image_url IS NOT NULL
            AND cr.click_url IS NOT NULL
        `;
        creativeRows.push(...crRes.rows);
      }

      for (const r of creativeRows) {
        const bidPrice = Number(r.bid_price);
        if (bidPrice < floor) continue;
        const crSize = r.creative_size;
        if (!crSize || !formatSizes.includes(crSize)) continue;
        const img = r.image_url as string;
        const clk = r.click_url as string;
        if (requireSecure && !urlsSecureEnough(img, clk)) continue;
        internalPool.push({
          campaignId: r.campaign_id,
          creativeId: r.creative_id,
          bidPrice,
          imageUrl: img,
          clickUrl: clk,
          size: crSize,
          advertiserDomain: r.advertiser_domain ?? normHost(r.advertiser_name ?? undefined),
          iabCat: r.iab_cat,
          creativeApi: r.creative_api
        });
      }
    }

    const pool: PoolBid[] = internalPool.map((b) => ({ kind: "internal" as const, ...b }));

    if (opts?.fullRequest) {
      const dspRequest = JSON.parse(JSON.stringify(opts.fullRequest)) as OpenRTB26BidRequest;
      if (opts.fullRequest.user?.buyeruid && dspRequest.user) {
        dspRequest.user.buyeruid = opts.fullRequest.user.buyeruid;
      }
      const dspBids = await requestAllDspBids(dspRequest);
      for (const d of dspBids) {
        if (d.price >= floor) pool.push({ kind: "dsp", dspBid: d, bidPrice: d.price });
      }
    }

    pool.sort((a, b) => b.bidPrice - a.bidPrice);

    if (pool.length === 0) {
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
        userAgent: ua,
        deviceIp: devIp
      });
      if (id) console.log("[auction]", id, "bids:", 0, "winner:", "none", "price:", "-");
      return id ? { auctionLogId: id, winner: null, bidCount: 0 } : null;
    }

    const winner = pool[0];
    const second = pool[1];
    const at = opts?.fullRequest?.at === 1 ? 1 : 2;
    const clearingPrice =
      at === 1
        ? winner.bidPrice
        : second
          ? second.bidPrice + 0.01
          : winner.bidPrice;

    if (winner.kind === "internal") {
      const { w, h } = parseSize(winner.size);
      const adm = buildAdm(winner.imageUrl, winner.clickUrl, w, h);
      const finalAdomain = winner.advertiserDomain ? [winner.advertiserDomain] : [];

      const auctionLogId = await insertAuctionLog({
        openrtbRequestId,
        adUnitId: adUnit.id,
        publisherId: adUnit.publisher_id,
        winnerCampaignId: winner.campaignId,
        winnerCreativeId: winner.creativeId,
        winningBid: clearingPrice,
        floorPrice: floor,
        bidCount: pool.length,
        pageUrl,
        userAgent: ua,
        demandSource: "internal",
        deviceIp: devIp
      });

      if (!auctionLogId) return null;
      console.log("[auction]", auctionLogId, "bids:", pool.length, "winner:", winner.campaignId, "price:", clearingPrice);

      return {
        auctionLogId,
        bidCount: pool.length,
        winner: {
          auctionId: auctionLogId,
          winnerId: winner.campaignId,
          creativeId: winner.creativeId,
          clearingPrice,
          imageUrl: winner.imageUrl,
          clickUrl: winner.clickUrl,
          adm,
          w,
          h,
          adomain: finalAdomain.length ? finalAdomain : undefined,
          iurl: winner.imageUrl,
          cid: winner.campaignId,
          crid: winner.creativeId,
          cat: winner.iabCat ?? undefined,
          cattax: winner.iabCat?.length ? 1 : undefined,
          api: winner.creativeApi ?? undefined,
          demandSource: "internal"
        }
      };
    }

    const d = winner.dspBid;
    const auctionLogId = await insertAuctionLog({
      openrtbRequestId,
      adUnitId: adUnit.id,
      publisherId: adUnit.publisher_id,
      winnerCampaignId: null,
      winnerCreativeId: null,
      winningBid: clearingPrice,
      floorPrice: floor,
      bidCount: pool.length,
      pageUrl,
      userAgent: ua,
      demandSource: d.dsp.name,
      deviceIp: devIp
    });

    if (!auctionLogId) return null;
    console.log("[auction]", auctionLogId, "bids:", pool.length, "winner dsp:", d.dsp.name, "price:", clearingPrice);

    return {
      auctionLogId,
      bidCount: pool.length,
      winner: {
        auctionId: auctionLogId,
        winnerId: d.dsp.id,
        creativeId: d.crid ?? d.dsp.id,
        clearingPrice,
        imageUrl: "",
        clickUrl: "",
        adm: d.adm,
        w: d.w,
        h: d.h,
        adomain: d.adomain,
        iurl: undefined,
        cid: undefined,
        crid: d.crid,
        cat: undefined,
        cattax: undefined,
        api: undefined,
        demandSource: d.dsp.name
      }
    };
  } catch (e) {
    console.error("[auction-engine] runAuction failed:", e);
    throw e;
  }
}
