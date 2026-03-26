import { createHash } from "node:crypto";

import type {
  OpenRTB26BidRequest,
  OpenRTB26Content,
  OpenRTB26Device,
  OpenRTB26Geo,
  OpenRTB26Regs,
  OpenRTB26Site,
  OpenRTB26User
} from "@/lib/openrtb-types";

export type EnrichedBidRequest = OpenRTB26BidRequest;

export type GeoResult = {
  country: string;
  region?: string;
  city?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
  is_mobile?: boolean;
  is_proxy?: boolean;
  is_datacenter?: boolean;
};

const IAB_KEYWORDS: Record<string, string> = {
  news: "IAB12",
  politics: "IAB11",
  sports: "IAB17",
  tech: "IAB19",
  finance: "IAB13",
  health: "IAB14",
  travel: "IAB20",
  food: "IAB8",
  entertainment: "IAB1",
  fashion: "IAB18",
  science: "IAB15",
  auto: "IAB2",
  education: "IAB5",
  business: "IAB3",
  gaming: "IAB9",
  music: "IAB1-6"
};

export function hashIp(ip: string): string {
  return createHash("sha256").update(ip.trim().toLowerCase()).digest("hex");
}

function mapConnectionType(effectiveType: string): number | undefined {
  const k = effectiveType.toLowerCase();
  const table: Record<string, number> = {
    "slow-2g": 4,
    "2g": 4,
    "3g": 5,
    "4g": 6,
    "5g": 7,
    wifi: 2,
    ethernet: 1
  };
  return table[k];
}

/** Lightweight UA parse — no external dependency. */
export function parseUserAgent(ua: string): {
  deviceType: number;
  make?: string;
  model?: string;
  os?: string;
  osVersion?: string;
  browser?: string;
  browserVersion?: string;
} {
  const u = ua.toLowerCase();
  let deviceType = 2;
  if (/smart-tv|smarttv|hbbtv|appletv|roku|tizen|tvos/.test(u)) deviceType = 3;
  else if (/tablet|ipad|playbook/.test(u)) deviceType = 5;
  else if (/mobile|iphone|ipod|android.*mobile/.test(u)) deviceType = 4;

  let os = "Other";
  let osVersion = "";
  if (/windows nt/.test(u)) {
    os = "Windows";
    const m = ua.match(/Windows NT ([0-9._]+)/i);
    osVersion = m?.[1] ?? "";
  } else if (/mac os x/.test(u)) {
    os = "macOS";
    const m = ua.match(/Mac OS X ([0-9_]+)/i);
    osVersion = (m?.[1] ?? "").replace(/_/g, ".");
  } else if (/android/.test(u)) {
    os = "Android";
    const m = ua.match(/Android ([0-9.]+)/i);
    osVersion = m?.[1] ?? "";
  } else if (/iphone|ipad|ipod/.test(u)) {
    os = "iOS";
    const m = ua.match(/OS ([0-9_]+)/i);
    osVersion = (m?.[1] ?? "").replace(/_/g, ".");
  }

  let browser = "Other";
  let browserVersion = "";
  if (/edg\//.test(u)) {
    browser = "Edge";
    const m = ua.match(/Edg\/([\d.]+)/i);
    browserVersion = m?.[1] ?? "";
  } else if (/chrome\//.test(u) && !/chromium/.test(u)) {
    browser = "Chrome";
    const m = ua.match(/Chrome\/([\d.]+)/i);
    browserVersion = m?.[1] ?? "";
  } else if (/safari\//.test(u) && !/chrome/.test(u)) {
    browser = "Safari";
    const m = ua.match(/Version\/([\d.]+)/i);
    browserVersion = m?.[1] ?? "";
  } else if (/firefox\//.test(u)) {
    browser = "Firefox";
    const m = ua.match(/Firefox\/([\d.]+)/i);
    browserVersion = m?.[1] ?? "";
  }

  return { deviceType, os, osVersion, browser, browserVersion };
}

export async function resolveGeo(ip: string): Promise<GeoResult | null> {
  if (!ip || ip === "unknown") return null;
  if (/^127\.|^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[0-1])\./.test(ip) || ip === "::1") {
    return null;
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 200);
  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,countryCode,region,city,zip,lat,lon,mobile,proxy,hosting`,
      { signal: controller.signal }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;
    if (data.status !== "success") return null;
    return {
      country: String(data.countryCode ?? ""),
      region: data.region != null ? String(data.region) : undefined,
      city: data.city != null ? String(data.city) : undefined,
      zip: data.zip != null ? String(data.zip) : undefined,
      lat: typeof data.lat === "number" ? data.lat : undefined,
      lon: typeof data.lon === "number" ? data.lon : undefined,
      is_mobile: data.mobile === true,
      is_proxy: data.proxy === true,
      is_datacenter: data.hosting === true
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/** Synchronous URL path keyword → IAB mapping (no network). */
export function classifyContent(url: string): string[] {
  if (!url) return [];
  let path = "";
  try {
    path = new URL(url).pathname.toLowerCase();
  } catch {
    return [];
  }
  const segments = path.split("/").filter(Boolean);
  const categories: string[] = [];
  for (const seg of segments) {
    for (const [keyword, cat] of Object.entries(IAB_KEYWORDS)) {
      if (seg.includes(keyword)) categories.push(cat);
    }
  }
  return [...new Set(categories)];
}

export function classifyPage(url: string): string[] {
  return classifyContent(url);
}

function readImpExt(req: OpenRTB26BidRequest): Record<string, unknown> {
  const ext = req.imp?.[0]?.ext;
  return ext && typeof ext === "object" ? { ...(ext as Record<string, unknown>) } : {};
}

/**
 * Merge client `imp[0].ext` signals with server IP/UA/geo and return a full OpenRTB request for auction/DSP.
 */
export async function enrichBidRequest(raw: OpenRTB26BidRequest, request: Request): Promise<EnrichedBidRequest> {
  const base = JSON.parse(JSON.stringify(raw)) as OpenRTB26BidRequest;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "";
  const uaHeader = request.headers.get("user-agent") || "";
  const ua = base.device?.ua || uaHeader;

  // Client-supplied geo (mde.js / tag) is authoritative for speed; server IP lookup is optional enhancement.
  let serverGeo: GeoResult | null = null;
  if (ip) {
    try {
      serverGeo = await Promise.race([
        resolveGeo(ip),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 200))
      ]);
    } catch {
      serverGeo = null;
    }
  }

  const deviceUa = parseUserAgent(ua);
  const ext = readImpExt(base);

  const ipv6Hdr = request.headers.get("x-forwarded-for-v6");

  const clientGeo = base.device?.geo;
  const extGeo: OpenRTB26Geo = serverGeo
    ? {
        ...clientGeo,
        lat: serverGeo.lat,
        lon: serverGeo.lon,
        country: serverGeo.country,
        region: serverGeo.region,
        city: serverGeo.city,
        zip: serverGeo.zip,
        type: 2
      }
    : {
        ...clientGeo,
        type: clientGeo?.type ?? 2
      };

  const connRaw = ext.connectionType;
  const connectiontype =
    typeof connRaw === "string" ? mapConnectionType(connRaw) : typeof connRaw === "number" ? connRaw : undefined;

  const mergedDevice: OpenRTB26Device = {
    ...base.device,
    ua,
    ip: ip ? hashIp(ip) : undefined,
    geo: extGeo,
    devicetype: base.device?.devicetype ?? deviceUa.deviceType,
    make: base.device?.make ?? deviceUa.make,
    model: base.device?.model ?? deviceUa.model,
    os: base.device?.os ?? deviceUa.os,
    osv: base.device?.osv ?? deviceUa.osVersion,
    hwv:
      typeof ext.hardwareConcurrency === "number"
        ? String(ext.hardwareConcurrency)
        : base.device?.hwv,
    connectiontype: connectiontype ?? base.device?.connectiontype,
    w: typeof ext.screenWidth === "number" ? ext.screenWidth : base.device?.w,
    h: typeof ext.screenHeight === "number" ? ext.screenHeight : base.device?.h,
    language:
      base.device?.language ||
      request.headers.get("accept-language")?.split(",")[0]?.split("-")[0]?.trim(),
    ext: {
      ...(typeof base.device?.ext === "object" && base.device.ext ? base.device.ext : {}),
      js: 1,
      mde_pxratio: typeof ext.devicePixelRatio === "number" ? ext.devicePixelRatio : undefined,
      mde_ipv6_h: ipv6Hdr ? hashIp(ipv6Hdr.trim()) : undefined
    }
  };

  const pageUrl = base.site?.page || (typeof ext.url === "string" ? ext.url : "") || "";
  const contentCats = classifyContent(pageUrl || "");
  const pageCats = classifyPage(pageUrl || "");

  const content: OpenRTB26Content = {
    ...base.site?.content,
    title: typeof ext.title === "string" ? ext.title : base.site?.content?.title,
    keywords:
      typeof ext.articleTags === "string"
        ? ext.articleTags
        : base.site?.content?.keywords,
    cat:
      typeof ext.articleSection === "string"
        ? [ext.articleSection]
        : base.site?.content?.cat
  };

  const siteExt = {
    ...(typeof base.site?.ext === "object" && base.site.ext ? base.site.ext : {}),
    mde_keywords:
      typeof ext.keywords === "string" ? ext.keywords : (base.site?.ext as Record<string, unknown>)?.mde_keywords
  };
  const mergedSite: OpenRTB26Site = {
    ...base.site,
    page: base.site?.page || (typeof ext.url === "string" ? ext.url : undefined),
    ref: base.site?.ref || (typeof ext.referrer === "string" ? ext.referrer : undefined),
    cat: base.site?.cat?.length ? base.site.cat : contentCats.length ? contentCats : undefined,
    content,
    pagecat: pageCats.length ? pageCats : base.site?.pagecat,
    ext: siteExt
  };

  const userExtIn = (base.user?.ext as Record<string, unknown> | undefined) ?? {};
  const uaParsed = parseUserAgent(ua);
  const mergedUserExt: Record<string, unknown> = {
    ...userExtIn,
    mde_browser: { os: uaParsed.os, browser: uaParsed.browser },
    sessionId: ext.sessionId ?? userExtIn.sessionId,
    sessionPageCount: ext.sessionPageCount ?? userExtIn.sessionPageCount,
    daysSinceFirstVisit: ext.daysSinceFirstVisit ?? userExtIn.daysSinceFirstVisit,
    isNewUser: ext.isNewSession === true && Number(ext.daysSinceFirstVisit) === 0,
    totalPageViews: ext.totalPageViews ?? userExtIn.totalPageViews,
    scrollDepth: ext.scrollDepth ?? userExtIn.scrollDepth,
    timeOnPage: ext.timeOnPage ?? userExtIn.timeOnPage,
    above_fold: ext.above_fold ?? userExtIn.above_fold,
    timezone: ext.timezone ?? userExtIn.timezone,
    locale: ext.locale ?? userExtIn.locale,
    consentGiven: ext.consentGiven ?? userExtIn.consentGiven,
    tcf: ext.tcfConsent ?? userExtIn.tcf,
    usp: ext.uspString ?? userExtIn.usp,
    freq_caps: userExtIn.freq_caps,
    freq_caps_session: userExtIn.freq_caps_session
  };

  const mergedUser: OpenRTB26User = {
    ...base.user,
    id: typeof ext.userId === "string" ? ext.userId : base.user?.id,
    ext: mergedUserExt
  };

  const regsBase = base.regs ?? {};
  const regsExt = {
    ...(typeof regsBase.ext === "object" && regsBase.ext ? (regsBase.ext as object) : {}),
    ...(typeof ext.gppString === "string" && ext.gppString ? { gpp: ext.gppString } : {})
  };
  const mergedRegs: OpenRTB26Regs = {
    ...regsBase,
    us_privacy:
      regsBase.us_privacy ??
      (typeof ext.uspString === "string" ? ext.uspString : undefined),
    ext: regsExt
  };

  base.device = mergedDevice;
  base.site = mergedSite;
  base.user = mergedUser;
  base.regs = mergedRegs;
  base.at = base.at ?? 2;
  base.tmax = base.tmax ?? 500;

  return base;
}

/** Compact snapshot stored on `auction_log.raw_signals` and in `signal_events.raw_signals`. */
export function buildAuctionSignalSnapshot(
  raw: OpenRTB26BidRequest,
  enriched: OpenRTB26BidRequest
): Record<string, unknown> {
  const impExt = raw.imp?.[0]?.ext as Record<string, unknown> | undefined;
  return {
    mde_client: impExt?.mde_signals ?? null,
    imp_ext: impExt ?? null,
    source: enriched.source,
    device: {
      geo: enriched.device?.geo,
      devicetype: enriched.device?.devicetype,
      connectiontype: enriched.device?.connectiontype,
      os: enriched.device?.os,
      browser_ua_device: enriched.device?.ua ? parseUserAgent(String(enriched.device.ua)) : null
    },
    site: {
      domain: enriched.site?.domain,
      page: enriched.site?.page,
      cat: enriched.site?.cat,
      pagecat: enriched.site?.pagecat
    },
    user: { id: enriched.user?.id, ext: enriched.user?.ext },
    regs: enriched.regs,
    schain: enriched.source?.schain
  };
}
