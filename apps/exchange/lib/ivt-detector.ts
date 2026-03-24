const BOT_UA_PATTERNS = [
  /googlebot/i,
  /bingbot/i,
  /slurp/i,
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /sogou/i,
  /exabot/i,
  /facebot/i,
  /ia_archiver/i,
  /python-requests/i,
  /curl\//i,
  /wget\//i,
  /scrapy/i,
  /phantomjs/i,
  /headlesschrome/i,
  /puppeteer/i,
  /selenium/i,
  /playwright/i,
  /go-http-client/i,
  /java\/\d/i,
  /ruby/i,
  /perl/i,
  /postman/i,
  /insomnia/i,
  /httpie/i
];

const DATACENTER_PATTERNS = [
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[01])\./,
  /^192\.168\./,
  /^127\./,
  /^0\./,
  /^169\.254\./
];

export interface IVTResult {
  isBot: boolean;
  isDatacenter: boolean;
  isSuspicious: boolean;
  reason: string | null;
  givtScore: number;
}

export function detectIVT(userAgent: string, ip: string, referer: string): IVTResult {
  void referer;
  const ua = userAgent || "";
  const isBot = BOT_UA_PATTERNS.some((p) => p.test(ua));
  const isDatacenter = ip && ip !== "unknown" ? DATACENTER_PATTERNS.some((p) => p.test(ip)) : false;
  const noUA = !ua || ua.length < 10;
  const isSuspicious = noUA || ua.includes("bot") || ua.includes("crawler");

  let givtScore = 0;
  if (isBot) givtScore = 100;
  else if (isDatacenter) givtScore = 80;
  else if (noUA) givtScore = 70;
  else if (isSuspicious) givtScore = 50;

  return {
    isBot,
    isDatacenter,
    isSuspicious,
    reason: isBot ? "known_bot_ua" : isDatacenter ? "datacenter_ip" : noUA ? "missing_ua" : null,
    givtScore
  };
}

const recentImpressionAt = new Map<string, number>();
const IMPRESSION_TTL_MS = 120_000;

function pruneImpressionMap(now: number) {
  for (const [k, t] of recentImpressionAt) {
    if (now - t > IMPRESSION_TTL_MS) recentImpressionAt.delete(k);
  }
}

/** `auctionLogId` = auction_log row UUID from pixel. */
export function isDuplicateImpression(auctionLogId: string): boolean {
  const now = Date.now();
  pruneImpressionMap(now);
  if (recentImpressionAt.has(auctionLogId)) return true;
  recentImpressionAt.set(auctionLogId, now);
  return false;
}

const clickCounts = new Map<string, { count: number; resetAt: number }>();

export function isClickFraud(ip: string): boolean {
  const now = Date.now();
  const entry = clickCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    clickCounts.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count++;
  return entry.count > 3;
}
