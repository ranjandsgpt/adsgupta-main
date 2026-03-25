import { isCampaignOverBudget } from "@/lib/budget-check";
import { cacheGet, cacheSet } from "@/lib/cache";
import { requestAllDspBids, type DspBid } from "@/lib/dsp-bidder";
import { sql, getPool } from "@/lib/db";
import { getEffectiveFloor } from "@/lib/floor-engine";
import {
  parseCoppa,
  parseGdprConsent,
  parseUsp,
  shouldRedactUserFieldsInAuctionLog
} from "@/lib/privacy";
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
  /** Datacenter / high-risk IVT — auction runs but auction_log.is_ivt = true */
  markIvt?: boolean;
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
  privacySuppressed?: boolean;
  isIvt?: boolean;
}): Promise<string | null> {
  const ins = await sql<{ id: string }>`
    INSERT INTO auction_log
    (auction_id, ad_unit_id, publisher_id, winning_campaign_id, winning_creative_id, winning_bid, floor_price, bid_count, cleared, page_url, user_agent, demand_source, device_ip, privacy_suppressed, is_ivt)
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
      ${args.deviceIp ?? null},
      ${args.privacySuppressed ?? false},
      ${args.isIvt ?? false}
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

type JoinRow = {
  campaign_id: string;
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
  creative_id: string;
  image_url: string;
  click_url: string;
  creative_size: string;
  ab_test_active: boolean | null;
  freq_cap_day: number | null;
  freq_cap_session: number | null;
  ab_group: string | null;
  ab_weight: string | null;
};

/** A/B: one creative per size via weighted random when ab_test_active. */
function collapseAbTestRows(rows: JoinRow[]): JoinRow[] {
  const ab = rows[0]?.ab_test_active === true;
  if (!ab || rows.length <= 1) return rows;
  const bySize = new Map<string, JoinRow[]>();
  for (const r of rows) {
    const k = r.creative_size;
    const arr = bySize.get(k) ?? [];
    arr.push(r);
    bySize.set(k, arr);
  }
  const out: JoinRow[] = [];
  for (const list of bySize.values()) {
    if (list.length === 1) {
      out.push(list[0]!);
      continue;
    }
    const total = list.reduce((s, x) => s + Math.max(0, Number(x.ab_weight ?? 50)), 0) || 1;
    let pick = Math.random() * total;
    let chosen = list[0]!;
    for (const x of list) {
      const w = Math.max(0, Number(x.ab_weight ?? 50));
      pick -= w;
      if (pick <= 0) {
        chosen = x;
        break;
      }
    }
    out.push(chosen);
  }
  return out;
}

function isFreqCapBlocked(
  campaignId: string,
  freqDay: number | null | undefined,
  freqSess: number | null | undefined,
  day?: Record<string, number>,
  sess?: Record<string, number>
): boolean {
  const fd = freqDay != null ? Number(freqDay) : 0;
  const fs = freqSess != null ? Number(freqSess) : 0;
  if (fd > 0 && day && (day[campaignId] ?? 0) >= fd) return true;
  if (fs > 0 && sess && (sess[campaignId] ?? 0) >= fs) return true;
  return false;
}

async function loadActiveCampaignCreativesJoin(): Promise<JoinRow[]> {
  const key = "campaigns:active";
  const cached = cacheGet<JoinRow[]>(key);
  if (cached) {
    console.log("[cache]", key, "HIT");
    return cached;
  }
  console.log("[cache]", key, "MISS");
  const pool = getPool();
  const { rows } = await pool.query<JoinRow>(`
    SELECT
      c.id AS campaign_id,
      c.bid_price::text AS bid_price,
      c.daily_budget::text AS daily_budget,
      c.target_sizes,
      c.target_environments,
      c.target_domains,
      c.target_geos,
      c.target_devices,
      c.advertiser_domain,
      COALESCE(c.advertiser_name, c.advertiser) AS advertiser_name,
      c.iab_cat,
      c.creative_api,
      COALESCE(c.ab_test_active, false) AS ab_test_active,
      c.freq_cap_day,
      c.freq_cap_session,
      cr.ab_group,
      cr.ab_weight::text AS ab_weight,
      cr.id AS creative_id,
      cr.image_url,
      cr.click_url,
      cr.size AS creative_size
    FROM campaigns c
    INNER JOIN creatives cr ON cr.campaign_id = c.id
    WHERE c.status = 'active'
      AND (c.start_date IS NULL OR c.start_date <= CURRENT_DATE)
      AND (c.end_date IS NULL OR c.end_date >= CURRENT_DATE)
      AND cr.status IN ('active', 'approved')
      AND cr.image_url IS NOT NULL
      AND cr.click_url IS NOT NULL
      AND (COALESCE(cr.scan_passed, true) = true OR cr.status = 'approved')
  `);
  const list = rows as JoinRow[];
  cacheSet(key, list, 30_000);
  return list;
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
  const auctionStart = typeof performance !== "undefined" ? performance.now() : Date.now();
  try {
    const ua = opts?.device?.ua ? String(opts.device.ua).slice(0, 2000) : null;
    const devIp = opts?.ipForLog ?? opts?.device?.ip ?? null;
    if (devIp) console.log("[openrtb] device.ip (log):", devIp);

    const regs = opts?.fullRequest?.regs;
    const consent = parseGdprConsent({ gdpr: regs?.gdpr }, { consent: opts?.fullRequest?.user?.consent });
    const coppaRegs = parseCoppa(regs ?? {});
    const { redact, privacySuppressed } = shouldRedactUserFieldsInAuctionLog(consent, coppaRegs);
    const logUa = redact ? null : ua;
    const logIp = redact ? null : devIp;
    const usp = parseUsp(regs ?? {});
    const markIvt = opts?.markIvt === true;

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
        userAgent: logUa,
        deviceIp: logIp,
        privacySuppressed,
        isIvt: markIvt
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
        userAgent: logUa,
        deviceIp: logIp,
        privacySuppressed,
        isIvt: markIvt
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
        userAgent: logUa,
        deviceIp: logIp,
        privacySuppressed,
        isIvt: markIvt
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

    const joinRows = await loadActiveCampaignCreativesJoin();
    const byCampaign = new Map<string, JoinRow[]>();
    for (const r of joinRows) {
      const arr = byCampaign.get(r.campaign_id) ?? [];
      arr.push(r);
      byCampaign.set(r.campaign_id, arr);
    }

    const userExt = opts?.fullRequest?.user?.ext as Record<string, unknown> | undefined;
    const freqCapsDay =
      userExt && typeof userExt.freq_caps === "object" && userExt.freq_caps !== null
        ? (userExt.freq_caps as Record<string, number>)
        : undefined;
    const freqCapsSession =
      userExt && typeof userExt.freq_caps_session === "object" && userExt.freq_caps_session !== null
        ? (userExt.freq_caps_session as Record<string, number>)
        : undefined;

    const internalPool: InternalBid[] = [];

    for (const [campaignId, rowsRaw] of byCampaign) {
      const rows = collapseAbTestRows(rowsRaw);
      const c0 = rows[0];
      if (!c0) continue;
      if (isFreqCapBlocked(campaignId, c0.freq_cap_day, c0.freq_cap_session, freqCapsDay, freqCapsSession)) {
        continue;
      }
      const c = {
        id: campaignId,
        target_sizes: c0.target_sizes,
        target_environments: c0.target_environments,
        target_domains: c0.target_domains,
        target_geos: c0.target_geos,
        target_devices: c0.target_devices,
        advertiser_domain: c0.advertiser_domain,
        advertiser_name: c0.advertiser_name,
        iab_cat: c0.iab_cat,
        creative_api: c0.creative_api
      };
      if (regs?.coppa === 1 && c.target_geos && c.target_geos.length > 0) continue;
      if (campaignBlockedByBcat(c.iab_cat, bcat)) continue;
      const advDom = c0.advertiser_domain ?? null;
      if (advDom && campaignBlockedByBadv(advDom, badv)) continue;
      if (!campaignMatchesTargeting(c, targetingCtx)) continue;
      const budget = c0.daily_budget != null ? Number(c0.daily_budget) : NaN;
      if (!Number.isNaN(budget) && budget > 0) {
        if (await isCampaignOverBudget(campaignId, budget)) continue;
      }
      for (const r of rows) {
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
      const dspBids = await requestAllDspBids(opts.fullRequest, { stripUserIdentity: usp.optedOut });
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
        userAgent: logUa,
        deviceIp: logIp,
        privacySuppressed,
        isIvt: markIvt
      });
      if (id) console.log("[auction]", id, "bids:", 0, "winner:", "none", "price:", "-");
      return id ? { auctionLogId: id, winner: null, bidCount: 0 } : null;
    }

    const winner = pool[0];
    const second = pool[1];
    const at = opts?.fullRequest?.at === 1 ? 1 : 2;
    const clearingPrice =
      at === 1 ? winner.bidPrice : second ? second.bidPrice + 0.01 : winner.bidPrice;

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
        userAgent: logUa,
        demandSource: "internal",
        deviceIp: logIp,
        privacySuppressed,
        isIvt: markIvt
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
      userAgent: logUa,
      demandSource: d.dsp.name,
      deviceIp: logIp,
      privacySuppressed,
      isIvt: markIvt
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
  } finally {
    const auctionMs =
      (typeof performance !== "undefined" ? performance.now() : Date.now()) - auctionStart;
    if (auctionMs > 100) {
      console.warn("[auction] SLOW", auctionMs.toFixed(1), "ms — target is <100ms");
    }
  }
}