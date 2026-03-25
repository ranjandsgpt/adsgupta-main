import { sql } from "@/lib/db";

export type SignalEventInput = {
  session_id: string | null;
  user_id: string | null;
  publisher_id: string | null;
  ad_unit_id: string | null;
  event_type: string;
  url: string | null;
  referrer: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  device_type: string | null;
  os: string | null;
  browser: string | null;
  connection_type: string | null;
  iab_categories: string[] | null;
  above_fold: boolean | null;
  scroll_depth: number | null;
  time_on_page: number | null;
  session_page_count: number | null;
  days_since_first_visit: number | null;
  is_new_user: boolean | null;
  timezone: string | null;
  screen_width: number | null;
  screen_height: number | null;
  device_pixel_ratio: number | null;
  is_mobile: boolean | null;
  is_proxy: boolean | null;
  is_datacenter: boolean | null;
  consent_given: boolean | null;
  raw_signals: Record<string, unknown> | null;
  auction_id: string | null;
};

type UserProfileRow = {
  user_id: string;
  total_page_views: number;
  countries: string[] | null;
  cities: string[] | null;
  devices: string[] | null;
  browsers: string[] | null;
  iab_interests: string[] | null;
  iab_frequencies: Record<string, number> | null;
  publisher_ids: string[] | null;
  total_sessions: number;
  last_seen: string | null;
};

type SegmentRow = {
  id: string;
  rules: Record<string, unknown>;
};

type Condition = {
  field: string;
  equals?: unknown;
  contains?: string;
  gte?: number;
  lte?: number;
  in?: unknown[];
  not_in?: unknown[];
};

type SegmentRules = {
  conditions?: Condition[];
  operator?: string;
  ttl_days?: number;
};

function uniqStrings(arr: (string | null | undefined)[]): string[] {
  return [...new Set(arr.filter((x): x is string => typeof x === "string" && x.length > 0))];
}

function mergeFreq(
  prev: Record<string, number> | null | undefined,
  cats: string[] | null | undefined
): Record<string, number> {
  const out = { ...(prev && typeof prev === "object" ? prev : {}) };
  for (const c of cats ?? []) {
    out[c] = (out[c] ?? 0) + 1;
  }
  return out;
}

function evaluateCondition(
  profile: UserProfileRow,
  event: SignalEventInput,
  cond: Condition
): boolean {
  const key = cond.field;
  const pVal = (profile as unknown as Record<string, unknown>)[key];
  const eVal = (event as unknown as Record<string, unknown>)[key];
  const value = pVal !== undefined && pVal !== null ? pVal : eVal;
  if (value === undefined || value === null) return false;

  if (cond.equals !== undefined) return value === cond.equals;
  if (cond.contains !== undefined) {
    if (Array.isArray(value)) return value.map(String).some((v) => v.includes(String(cond.contains)));
    return String(value).includes(String(cond.contains));
  }
  if (cond.gte !== undefined) return Number(value) >= cond.gte;
  if (cond.lte !== undefined) return Number(value) <= cond.lte;
  if (cond.in !== undefined) return cond.in.map(String).includes(String(value));
  if (cond.not_in !== undefined) return !cond.not_in.map(String).includes(String(value));
  return false;
}

function evaluateSegmentRules(
  profile: UserProfileRow,
  event: SignalEventInput,
  rules: SegmentRules
): { score: number } | null {
  const conditions = rules.conditions || [];
  if (!conditions.length) return null;
  const operator = rules.operator || "AND";
  const results = conditions.map((c) => evaluateCondition(profile, event, c));
  const matches = operator === "OR" ? results.some(Boolean) : results.every(Boolean);
  if (!matches) return null;

  const lastMs = profile.last_seen ? new Date(profile.last_seen).getTime() : Date.now();
  const recencyDays = Math.max(0, Math.floor((Date.now() - lastMs) / 86400000));
  const recencyScore = Math.max(0, 100 - recencyDays * 5);
  const freqScore = Math.min(100, (profile.total_page_views || 0) * 2);
  return { score: (recencyScore + freqScore) / 2 };
}

async function evaluateSegmentMembership(userId: string, event: SignalEventInput): Promise<void> {
  const segments = await sql<SegmentRow>`
    SELECT id, rules FROM audience_segments WHERE status = 'active'
  `;
  const profileRes = await sql<UserProfileRow>`
    SELECT user_id, total_page_views, countries, cities, devices, browsers, iab_interests,
           iab_frequencies, publisher_ids, total_sessions, last_seen::text AS last_seen
    FROM user_profiles WHERE user_id = ${userId}
    LIMIT 1
  `;
  const profile = profileRes.rows[0];
  if (!profile) return;

  for (const segment of segments.rows) {
    const rules = segment.rules as SegmentRules;
    const matched = evaluateSegmentRules(profile, event, rules);
    if (!matched) continue;
    const ttl = Number(rules.ttl_days) || 30;
    await sql`
      INSERT INTO segment_memberships (user_id, segment_id, score, expires_at)
      VALUES (${userId}, ${segment.id}, ${matched.score}, now() + (${ttl}::int * interval '1 day'))
      ON CONFLICT (user_id, segment_id) DO UPDATE SET
        score = EXCLUDED.score,
        added_at = now(),
        expires_at = EXCLUDED.expires_at
    `;
  }
}

/**
 * Persist a signal row and upsert `user_profiles`; evaluate segment rules when `user_id` present.
 */
export async function processSignalEvent(event: SignalEventInput): Promise<void> {
  const rawJson = event.raw_signals ? JSON.stringify(event.raw_signals) : "null";

  await sql`
    INSERT INTO signal_events (
      session_id, user_id, publisher_id, ad_unit_id, event_type,
      url, referrer, country, region, city,
      device_type, os, browser, connection_type, iab_categories,
      above_fold, scroll_depth, time_on_page, session_page_count,
      days_since_first_visit, is_new_user, timezone,
      screen_width, screen_height, device_pixel_ratio,
      is_mobile, is_proxy, is_datacenter, consent_given,
      raw_signals, auction_id
    )
    VALUES (
      ${event.session_id},
      ${event.user_id},
      ${event.publisher_id},
      ${event.ad_unit_id},
      ${event.event_type},
      ${event.url},
      ${event.referrer},
      ${event.country},
      ${event.region},
      ${event.city},
      ${event.device_type},
      ${event.os},
      ${event.browser},
      ${event.connection_type},
      ${event.iab_categories},
      ${event.above_fold},
      ${event.scroll_depth},
      ${event.time_on_page},
      ${event.session_page_count},
      ${event.days_since_first_visit},
      ${event.is_new_user},
      ${event.timezone},
      ${event.screen_width},
      ${event.screen_height},
      ${event.device_pixel_ratio},
      ${event.is_mobile},
      ${event.is_proxy},
      ${event.is_datacenter},
      ${event.consent_given},
      ${rawJson === "null" ? null : rawJson}::jsonb,
      ${event.auction_id}
    )
  `;

  const uid = event.user_id;
  if (!uid) return;

  const freq = mergeFreq({}, event.iab_categories);
  const freqJson = JSON.stringify(freq);

  const existing = await sql<UserProfileRow>`
    SELECT user_id, total_page_views, countries, cities, devices, browsers, iab_interests,
           iab_frequencies, publisher_ids, total_sessions, last_seen::text AS last_seen
    FROM user_profiles WHERE user_id = ${uid} LIMIT 1
  `;

  if (!existing.rows[0]) {
    await sql`
      INSERT INTO user_profiles (
        user_id, last_seen, total_page_views, countries, cities, devices, browsers,
        iab_interests, iab_frequencies, publisher_ids, raw_profile
      )
      VALUES (
        ${uid},
        now(),
        1,
        ${event.country ? [event.country] : []}::text[],
        ${event.city ? [event.city] : []}::text[],
        ${event.device_type ? [event.device_type] : []}::text[],
        ${event.browser ? [event.browser] : []}::text[],
        ${event.iab_categories ?? []}::text[],
        ${freqJson}::jsonb,
        ${event.publisher_id ? [String(event.publisher_id)] : []}::text[],
        ${rawJson === "null" ? "{}" : rawJson}::jsonb
      )
    `;
  } else {
    const p = existing.rows[0];
    const countries = uniqStrings([...(p.countries ?? []), event.country]);
    const cities = uniqStrings([...(p.cities ?? []), event.city]);
    const devices = uniqStrings([...(p.devices ?? []), event.device_type]);
    const browsers = uniqStrings([...(p.browsers ?? []), event.browser]);
    const interests = uniqStrings([...(p.iab_interests ?? []), ...(event.iab_categories ?? [])]);
    const publishers = uniqStrings([
      ...(p.publisher_ids ?? []),
      event.publisher_id ? String(event.publisher_id) : null
    ]);
    const mergedFreq = mergeFreq(
      (p.iab_frequencies as Record<string, number> | null) ?? {},
      event.iab_categories
    );

    await sql`
      UPDATE user_profiles SET
        last_seen = now(),
        total_page_views = total_page_views + 1,
        countries = ${countries}::text[],
        cities = ${cities}::text[],
        devices = ${devices}::text[],
        browsers = ${browsers}::text[],
        iab_interests = ${interests}::text[],
        iab_frequencies = ${JSON.stringify(mergedFreq)}::jsonb,
        publisher_ids = ${publishers}::text[],
        raw_profile = COALESCE(raw_profile, '{}'::jsonb) || COALESCE(${(rawJson === "null" ? null : rawJson)}::jsonb, '{}'::jsonb)
      WHERE user_id = ${uid}
    `;
  }

  await evaluateSegmentMembership(uid, event);
}

/** Build `SignalEventInput` from auction context + enriched request snapshot. */
export function signalEventFromAuction(args: {
  snapshot: Record<string, unknown>;
  auctionId: string;
  publisherId: string;
  adUnitId: string;
}): SignalEventInput {
  const snap = args.snapshot;
  const mdeSignals = snap.mde_client as Record<string, unknown> | undefined;
  const device = mdeSignals?.device as Record<string, unknown> | undefined;
  const page = mdeSignals?.page as Record<string, unknown> | undefined;
  const session = mdeSignals?.session as Record<string, unknown> | undefined;
  const geoClient = mdeSignals?.geo as Record<string, unknown> | undefined;
  const engagement = mdeSignals?.engagement as Record<string, unknown> | undefined;
  const view = mdeSignals?.viewability as Record<string, unknown> | undefined;
  const site = snap.site as Record<string, unknown> | undefined;
  const dev = snap.device as Record<string, unknown> | undefined;
  const geo = dev?.geo as Record<string, unknown> | undefined;
  const user = snap.user as Record<string, unknown> | undefined;
  const uext = user?.ext as Record<string, unknown> | undefined;
  const br = uext?.mde_browser as Record<string, unknown> | undefined;

  const iab = (site?.cat as string[] | undefined) ?? null;

  const uid =
    (typeof user?.id === "string" && user.id) ||
    (typeof session?.userId === "string" && session.userId) ||
    null;

  return {
    session_id: typeof session?.sessionId === "string" ? session.sessionId : null,
    user_id: uid,
    publisher_id: args.publisherId,
    ad_unit_id: args.adUnitId,
    event_type: "bid_request",
    url: typeof page?.url === "string" ? page.url : typeof site?.page === "string" ? site.page : null,
    referrer: typeof page?.referrer === "string" ? page.referrer : null,
    country: typeof geo?.country === "string" ? geo.country : null,
    region: typeof geo?.region === "string" ? geo.region : null,
    city: typeof geo?.city === "string" ? geo.city : null,
    device_type:
      typeof device?.isCTV === "boolean" && device.isCTV
        ? "ctv"
        : typeof device?.isTablet === "boolean" && device.isTablet
          ? "tablet"
          : typeof device?.isMobile === "boolean" && device.isMobile
            ? "mobile"
            : "desktop",
    os: typeof br?.os === "string" ? br.os : null,
    browser: typeof br?.browser === "string" ? br.browser : null,
    connection_type:
      typeof device?.connectionType === "string" ? device.connectionType : null,
    iab_categories: iab,
    above_fold: typeof view?.above_fold === "boolean" ? view.above_fold : null,
    scroll_depth:
      typeof engagement?.scrollDepth === "number"
        ? Math.round(Number(engagement.scrollDepth))
        : typeof view?.scroll_depth_percent === "number"
          ? Math.round(Number(view.scroll_depth_percent))
          : null,
    time_on_page:
      typeof page?.timeOnPage === "number" ? Math.round(Number(page.timeOnPage)) : null,
    session_page_count:
      typeof session?.sessionPageCount === "number" ? Number(session.sessionPageCount) : null,
    days_since_first_visit:
      typeof session?.daysSinceFirstVisit === "number"
        ? Number(session.daysSinceFirstVisit)
        : null,
    is_new_user: session?.isNewSession === true ? true : null,
    timezone: typeof geoClient?.timezone === "string" ? geoClient.timezone : null,
    screen_width: typeof device?.screenWidth === "number" ? Number(device.screenWidth) : null,
    screen_height: typeof device?.screenHeight === "number" ? Number(device.screenHeight) : null,
    device_pixel_ratio:
      typeof device?.devicePixelRatio === "number" ? Number(device.devicePixelRatio) : null,
    is_mobile: typeof device?.isMobile === "boolean" ? device.isMobile : null,
    is_proxy: null,
    is_datacenter: null,
    consent_given:
      typeof uext?.consentGiven === "boolean"
        ? uext.consentGiven
        : typeof session?.consentGiven === "boolean"
          ? session.consentGiven
          : null,
    raw_signals: snap,
    auction_id: args.auctionId
  };
}
