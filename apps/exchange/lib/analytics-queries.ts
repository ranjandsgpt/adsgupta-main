import { sql } from "@/lib/db";

export type DateRange = { fromStr: string; toStr: string; prevFromStr: string; prevToStr: string };

export function parseRangeParams(sp: {
  range?: string | null;
  from?: string | null;
  to?: string | null;
}): DateRange {
  const range = sp.range ?? "7d";
  const now = new Date();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
  let start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));

  if (range === "today") {
    /* start/end today UTC */
  } else if (range === "yesterday") {
    start = new Date(start);
    start.setUTCDate(start.getUTCDate() - 1);
    end.setTime(start.getTime());
    end.setUTCHours(23, 59, 59, 999);
  } else if (range === "7d") {
    start.setUTCDate(start.getUTCDate() - 6);
  } else if (range === "30d") {
    start.setUTCDate(start.getUTCDate() - 29);
  } else if (range === "custom" && sp.from && sp.to) {
    start = new Date(sp.from + "T00:00:00.000Z");
    end.setTime(new Date(sp.to + "T23:59:59.999Z").getTime());
  }

  const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
  const prevEnd = new Date(start.getTime() - 86400000);
  const prevStart = new Date(prevEnd.getTime() - (days - 1) * 86400000);
  prevStart.setUTCHours(0, 0, 0, 0);
  prevEnd.setUTCHours(23, 59, 59, 999);

  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return {
    fromStr: iso(start),
    toStr: iso(end),
    prevFromStr: iso(prevStart),
    prevToStr: iso(prevEnd)
  };
}

function flagForLabel(label: string): string {
  const u = label.toUpperCase();
  if (u.length === 2 && /^[A-Z]{2}$/.test(u)) {
    return u.replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
  }
  return "🌐";
}

export async function getAdminAnalytics(opts: {
  fromStr: string;
  toStr: string;
  publisherId?: string | null;
  campaignId?: string | null;
}) {
  const { fromStr, toStr } = opts;
  const pubFilter = opts.publisherId?.trim() || null;
  const campFilter = opts.campaignId?.trim() || null;

  const ts = await sql<{
    date: string;
    auctions: string;
    impressions: string;
    clicks: string;
    revenue: string;
    cleared: string;
  }>`
    WITH days AS (
      SELECT generate_series(${fromStr}::date, ${toStr}::date, interval '1 day')::date AS d
    )
    SELECT
      days.d::text AS date,
      (SELECT COUNT(*)::text FROM auction_log al
        WHERE al.created_at::date = days.d
        AND (${pubFilter}::text IS NULL OR al.publisher_id = ${pubFilter}::uuid)
        AND (${campFilter}::text IS NULL OR al.winning_campaign_id = ${campFilter}::uuid)
      ) AS auctions,
      (SELECT COUNT(*)::text FROM impressions i
        WHERE i.created_at::date = days.d
        AND (${pubFilter}::text IS NULL OR EXISTS (SELECT 1 FROM ad_units u WHERE u.id = i.ad_unit_id AND u.publisher_id = ${pubFilter}::uuid))
        AND (${campFilter}::text IS NULL OR i.campaign_id = ${campFilter}::uuid)
      ) AS impressions,
      (SELECT COUNT(*)::text FROM clicks c
        INNER JOIN impressions i ON i.id = c.impression_id
        WHERE c.created_at::date = days.d
        AND (${pubFilter}::text IS NULL OR EXISTS (SELECT 1 FROM ad_units u WHERE u.id = i.ad_unit_id AND u.publisher_id = ${pubFilter}::uuid))
        AND (${campFilter}::text IS NULL OR i.campaign_id = ${campFilter}::uuid)
      ) AS clicks,
      (SELECT (COALESCE(SUM(i.winning_bid), 0) / 1000)::text FROM impressions i
        WHERE i.created_at::date = days.d
        AND (${pubFilter}::text IS NULL OR EXISTS (SELECT 1 FROM ad_units u WHERE u.id = i.ad_unit_id AND u.publisher_id = ${pubFilter}::uuid))
        AND (${campFilter}::text IS NULL OR i.campaign_id = ${campFilter}::uuid)
      ) AS revenue,
      (SELECT COUNT(*)::text FROM auction_log al
        WHERE al.created_at::date = days.d AND al.cleared = true
        AND (${pubFilter}::text IS NULL OR al.publisher_id = ${pubFilter}::uuid)
        AND (${campFilter}::text IS NULL OR al.winning_campaign_id = ${campFilter}::uuid)
      ) AS cleared
    FROM days
    ORDER BY date
  `;

  const timeseries = ts.rows.map((r) => {
    const auctions = Number(r.auctions);
    const cleared = Number(r.cleared);
    const impressions = Number(r.impressions);
    const clicks = Number(r.clicks);
    const revenue = Number(r.revenue);
    const fillRate = auctions > 0 ? (cleared / auctions) * 100 : 0;
    const avgCpm = impressions > 0 ? (revenue / impressions) * 1000 : 0;
    return {
      date: r.date,
      auctions,
      impressions,
      clicks,
      revenue,
      fillRate,
      avgCpm
    };
  });

  const topPub = await sql<{
    id: string;
    name: string;
    domain: string;
    impressions: string;
    revenue: string;
  }>`
    SELECT p.id, p.name, p.domain,
      COUNT(i.id)::text AS impressions,
      (COALESCE(SUM(i.winning_bid), 0) / 1000)::text AS revenue
    FROM publishers p
    INNER JOIN ad_units u ON u.publisher_id = p.id AND u.status <> 'archived'
    LEFT JOIN impressions i ON i.ad_unit_id = u.id AND i.created_at::date >= ${fromStr}::date AND i.created_at::date <= ${toStr}::date
    WHERE (${pubFilter}::text IS NULL OR p.id = ${pubFilter}::uuid)
    GROUP BY p.id, p.name, p.domain
    ORDER BY COUNT(i.id) DESC
    LIMIT 12
  `;

  const dailyImpPub = await sql<{ publisher_id: string; d: string; c: string }>`
    SELECT u.publisher_id::text, i.created_at::date::text AS d, COUNT(*)::text AS c
    FROM impressions i
    INNER JOIN ad_units u ON u.id = i.ad_unit_id
    WHERE i.created_at::date >= ${fromStr}::date AND i.created_at::date <= ${toStr}::date
    GROUP BY u.publisher_id, i.created_at::date
  `;
  const sparkByPub = new Map<string, number[]>();
  const dayList = timeseries.map((t) => t.date);
  for (const p of topPub.rows) {
    const arr = dayList.map((d) => 0);
    sparkByPub.set(p.id, arr);
  }
  for (const row of dailyImpPub.rows) {
    const arr = sparkByPub.get(row.publisher_id);
    if (!arr) continue;
    const idx = dayList.indexOf(row.d);
    if (idx >= 0) arr[idx] = Number(row.c);
  }

  const topPublishers = topPub.rows.map((p) => ({
    id: p.id,
    name: p.name,
    domain: p.domain,
    impressions: Number(p.impressions),
    revenue: Number(p.revenue),
    sparkline: sparkByPub.get(p.id) ?? dayList.map(() => 0)
  }));

  const topCamp = await sql<{
    id: string;
    name: string;
    impressions: string;
    clicks: string;
    spend: string;
  }>`
    SELECT c.id,
      COALESCE(c.campaign_name, c.name, 'Campaign') AS name,
      COUNT(DISTINCT i.id)::text AS impressions,
      COUNT(DISTINCT cl.id)::text AS clicks,
      (COALESCE(SUM(i.winning_bid), 0) / 1000)::text AS spend
    FROM campaigns c
    INNER JOIN impressions i ON i.campaign_id = c.id AND i.created_at::date >= ${fromStr}::date AND i.created_at::date <= ${toStr}::date
    LEFT JOIN clicks cl ON cl.impression_id = i.id
    WHERE (${campFilter}::text IS NULL OR c.id = ${campFilter}::uuid)
    GROUP BY c.id, c.campaign_name, c.name
    ORDER BY COUNT(DISTINCT i.id) DESC
    LIMIT 15
  `;

  const topCampaigns = topCamp.rows.map((r) => {
    const impr = Number(r.impressions);
    const clk = Number(r.clicks);
    const ctr = impr > 0 ? (clk / impr) * 100 : 0;
    return {
      id: r.id,
      name: r.name,
      impressions: impr,
      spend: Number(r.spend),
      ctr
    };
  });

  const topUnitsR = await sql<{
    id: string;
    name: string;
    impressions: string;
    auctions: string;
    cleared: string;
  }>`
    SELECT u.id, u.name,
      COUNT(DISTINCT i.id)::text AS impressions,
      (SELECT COUNT(*)::text FROM auction_log al WHERE al.ad_unit_id = u.id AND al.created_at::date >= ${fromStr}::date AND al.created_at::date <= ${toStr}::date) AS auctions,
      (SELECT COUNT(*)::text FROM auction_log al WHERE al.ad_unit_id = u.id AND al.created_at::date >= ${fromStr}::date AND al.created_at::date <= ${toStr}::date AND al.cleared = true) AS cleared
    FROM ad_units u
    LEFT JOIN impressions i ON i.ad_unit_id = u.id AND i.created_at::date >= ${fromStr}::date AND i.created_at::date <= ${toStr}::date
    WHERE u.status <> 'archived'
    AND (${pubFilter}::text IS NULL OR u.publisher_id = ${pubFilter}::uuid)
    GROUP BY u.id, u.name
    ORDER BY COUNT(DISTINCT i.id) DESC
    LIMIT 15
  `;

  const topUnits = topUnitsR.rows.map((u) => {
    const auc = Number(u.auctions);
    const clr = Number(u.cleared);
    return {
      id: u.id,
      name: u.name,
      impressions: Number(u.impressions),
      fillRate: auc > 0 ? (clr / auc) * 100 : 0
    };
  });

  const geoR = await sql<{ tld: string; impressions: string; revenue: string }>`
    SELECT
      COALESCE(NULLIF(SUBSTRING(p.domain FROM '\.([A-Za-z]+)$'), ''), 'global') AS tld,
      COUNT(i.id)::text AS impressions,
      (COALESCE(SUM(i.winning_bid), 0) / 1000)::text AS revenue
    FROM impressions i
    INNER JOIN ad_units u ON u.id = i.ad_unit_id
    INNER JOIN publishers p ON p.id = u.publisher_id
    WHERE i.created_at::date >= ${fromStr}::date AND i.created_at::date <= ${toStr}::date
    AND (${pubFilter}::text IS NULL OR p.id = ${pubFilter}::uuid)
    GROUP BY 1
    ORDER BY COUNT(i.id) DESC
    LIMIT 20
  `;

  const totalImpGeo = geoR.rows.reduce((s, r) => s + Number(r.impressions), 0) || 1;
  const geoBreakdown = geoR.rows.map((r) => ({
    country: r.tld.toUpperCase(),
    flag: r.tld.length === 2 ? flagForLabel(r.tld) : "🌐",
    impressions: Number(r.impressions),
    revenue: Number(r.revenue),
    percentage: (Number(r.impressions) / totalImpGeo) * 100
  }));

  const devR = await sql<{ device: string; impressions: string }>`
    SELECT
      CASE WHEN al.user_agent ILIKE '%mobile%' OR al.user_agent ILIKE '%android%' OR al.user_agent ILIKE '%iphone%' THEN 'mobile' ELSE 'desktop' END AS device,
      COUNT(*)::text AS impressions
    FROM auction_log al
    WHERE al.created_at::date >= ${fromStr}::date AND al.created_at::date <= ${toStr}::date
    AND (${pubFilter}::text IS NULL OR al.publisher_id = ${pubFilter}::uuid)
    GROUP BY 1
  `;
  const devTotal = devR.rows.reduce((s, r) => s + Number(r.impressions), 0) || 1;
  const deviceBreakdown = devR.rows.map((r) => ({
    device: r.device,
    impressions: Number(r.impressions),
    percentage: (Number(r.impressions) / devTotal) * 100
  }));

  const hourR = await sql<{ hour: string; auctions: string }>`
    SELECT EXTRACT(HOUR FROM al.created_at)::int::text AS hour, COUNT(*)::text AS auctions
    FROM auction_log al
    WHERE al.created_at::date >= ${fromStr}::date AND al.created_at::date <= ${toStr}::date
    AND (${pubFilter}::text IS NULL OR al.publisher_id = ${pubFilter}::uuid)
    GROUP BY 1
    ORDER BY 1
  `;
  const hourlyMap = new Map(hourR.rows.map((h) => [Number(h.hour), Number(h.auctions)]));
  const hourlyDistribution = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    auctions: hourlyMap.get(h) ?? 0
  }));

  const fillRateTrend = timeseries.map((t) => ({ date: t.date, fillRate: t.fillRate }));

  return {
    timeseries,
    topPublishers,
    topCampaigns,
    topUnits,
    geoBreakdown,
    deviceBreakdown,
    hourlyDistribution,
    fillRateTrend
  };
}

export async function getPublisherScopedAnalytics(publisherId: string, fromStr: string, toStr: string) {
  const ts = await sql<{
    date: string;
    impressions: string;
    revenue: string;
    auctions: string;
    cleared: string;
  }>`
    WITH days AS (SELECT generate_series(${fromStr}::date, ${toStr}::date, interval '1 day')::date AS d)
    SELECT days.d::text AS date,
      (SELECT COUNT(*)::text FROM impressions i
        INNER JOIN ad_units u ON u.id = i.ad_unit_id
        WHERE u.publisher_id = ${publisherId} AND i.created_at::date = days.d) AS impressions,
      (SELECT (COALESCE(SUM(i.winning_bid), 0) / 1000)::text FROM impressions i
        INNER JOIN ad_units u ON u.id = i.ad_unit_id
        WHERE u.publisher_id = ${publisherId} AND i.created_at::date = days.d) AS revenue,
      (SELECT COUNT(*)::text FROM auction_log al
        WHERE al.publisher_id = ${publisherId} AND al.created_at::date = days.d) AS auctions,
      (SELECT COUNT(*)::text FROM auction_log al
        WHERE al.publisher_id = ${publisherId} AND al.created_at::date = days.d AND al.cleared = true) AS cleared
    FROM days ORDER BY date
  `;

  const timeseries = ts.rows.map((r) => {
    const auctions = Number(r.auctions);
    const cleared = Number(r.cleared);
    const impressions = Number(r.impressions);
    const revenue = Number(r.revenue);
    return {
      date: r.date,
      impressions,
      revenue,
      fillRate: auctions > 0 ? (cleared / auctions) * 100 : 0
    };
  });

  const topUnitsR = await sql<{
    unit_id: string;
    unit_name: string;
    impressions: string;
    revenue: string;
    auctions: string;
    cleared: string;
  }>`
    SELECT u.id::text AS unit_id, u.name AS unit_name,
      COUNT(i.id)::text AS impressions,
      (COALESCE(SUM(i.winning_bid), 0) / 1000)::text AS revenue,
      (SELECT COUNT(*)::text FROM auction_log al WHERE al.ad_unit_id = u.id AND al.created_at::date >= ${fromStr}::date AND al.created_at::date <= ${toStr}::date) AS auctions,
      (SELECT COUNT(*)::text FROM auction_log al WHERE al.ad_unit_id = u.id AND al.created_at::date >= ${fromStr}::date AND al.created_at::date <= ${toStr}::date AND al.cleared = true) AS cleared
    FROM ad_units u
    LEFT JOIN impressions i ON i.ad_unit_id = u.id AND i.created_at::date >= ${fromStr}::date AND i.created_at::date <= ${toStr}::date
    WHERE u.publisher_id = ${publisherId} AND u.status <> 'archived'
    GROUP BY u.id, u.name
    ORDER BY COUNT(i.id) DESC
  `;

  const topUnits = topUnitsR.rows.map((u) => ({
    unitId: u.unit_id,
    unitName: u.unit_name,
    impressions: Number(u.impressions),
    revenue: Number(u.revenue),
    fillRate: Number(u.auctions) > 0 ? (Number(u.cleared) / Number(u.auctions)) * 100 : 0
  }));

  const pagesR = await sql<{ page_url: string; impressions: string; revenue: string }>`
    SELECT COALESCE(NULLIF(TRIM(al.page_url), ''), '(unknown)') AS page_url,
      COUNT(DISTINCT al.id)::text AS impressions,
      (COALESCE(SUM(CASE WHEN al.cleared THEN al.winning_bid ELSE 0 END), 0) / 1000)::text AS revenue
    FROM auction_log al
    WHERE al.publisher_id = ${publisherId}
    AND al.created_at::date >= ${fromStr}::date AND al.created_at::date <= ${toStr}::date
    GROUP BY 1
    ORDER BY COUNT(DISTINCT al.id) DESC
    LIMIT 25
  `;

  const topPages = pagesR.rows.map((p) => ({
    pageUrl: p.page_url,
    impressions: Number(p.impressions),
    revenue: Number(p.revenue)
  }));

  const revCur = timeseries.reduce((s, t) => s + t.revenue, 0);
  const days = timeseries.length || 7;
  const prevStart = new Date(fromStr + "T00:00:00Z");
  prevStart.setUTCDate(prevStart.getUTCDate() - days);
  const prevEnd = new Date(fromStr + "T00:00:00Z");
  prevEnd.setUTCDate(prevEnd.getUTCDate() - 1);
  const ps = prevStart.toISOString().slice(0, 10);
  const pe = prevEnd.toISOString().slice(0, 10);

  const prevRevR = await sql<{ v: string }>`
    SELECT (COALESCE(SUM(i.winning_bid), 0) / 1000)::text AS v
    FROM impressions i
    INNER JOIN ad_units u ON u.id = i.ad_unit_id
    WHERE u.publisher_id = ${publisherId}
    AND i.created_at::date >= ${ps}::date AND i.created_at::date <= ${pe}::date
  `;
  const prevRev = Number(prevRevR.rows[0]?.v ?? 0);
  const revenueChange = prevRev > 0 ? ((revCur - prevRev) / prevRev) * 100 : revCur > 0 ? 100 : 0;

  return {
    timeseries,
    topUnits,
    topPages,
    revenueTotal: revCur,
    revenueChange
  };
}

export async function getDemandAnalytics(email: string, fromStr: string, toStr: string) {
  const emailMatch = email.trim().toLowerCase();

  const ts = await sql<{
    date: string;
    spend: string;
    impressions: string;
    clicks: string;
    wins: string;
    auctions: string;
  }>`
    WITH days AS (SELECT generate_series(${fromStr}::date, ${toStr}::date, interval '1 day')::date AS d)
    SELECT days.d::text AS date,
      (SELECT (COALESCE(SUM(i.winning_bid), 0) / 1000)::text FROM impressions i
        INNER JOIN campaigns c ON c.id = i.campaign_id
        WHERE i.created_at::date = days.d
        AND (LOWER(TRIM(COALESCE(c.advertiser_email, ''))) = ${emailMatch}
          OR LOWER(TRIM(COALESCE(c.contact_email, ''))) = ${emailMatch})
      ) AS spend,
      (SELECT COUNT(*)::text FROM impressions i
        INNER JOIN campaigns c ON c.id = i.campaign_id
        WHERE i.created_at::date = days.d
        AND (LOWER(TRIM(COALESCE(c.advertiser_email, ''))) = ${emailMatch}
          OR LOWER(TRIM(COALESCE(c.contact_email, ''))) = ${emailMatch})
      ) AS impressions,
      (SELECT COUNT(*)::text FROM clicks cl
        INNER JOIN impressions i ON i.id = cl.impression_id
        INNER JOIN campaigns c ON c.id = i.campaign_id
        WHERE cl.created_at::date = days.d
        AND (LOWER(TRIM(COALESCE(c.advertiser_email, ''))) = ${emailMatch}
          OR LOWER(TRIM(COALESCE(c.contact_email, ''))) = ${emailMatch})
      ) AS clicks,
      (SELECT COUNT(*)::text FROM auction_log al
        INNER JOIN campaigns c ON c.id = al.winning_campaign_id
        WHERE al.created_at::date = days.d
        AND al.winning_campaign_id IS NOT NULL
        AND (LOWER(TRIM(COALESCE(c.advertiser_email, ''))) = ${emailMatch}
          OR LOWER(TRIM(COALESCE(c.contact_email, ''))) = ${emailMatch})
      ) AS wins,
      (SELECT COUNT(*)::text FROM auction_log al WHERE al.created_at::date = days.d) AS auctions
    FROM days ORDER BY date
  `;

  const timeseries = ts.rows.map((r) => {
    const impressions = Number(r.impressions);
    const clicks = Number(r.clicks);
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const wins = Number(r.wins);
    const auctions = Number(r.auctions);
    const winRate = auctions > 0 ? (wins / auctions) * 100 : 0;
    return {
      date: r.date,
      spend: Number(r.spend),
      impressions,
      clicks,
      ctr,
      winRate
    };
  });

  const topCreativesR = await sql<{
    id: string;
    image_url: string | null;
    impressions: string;
    clicks: string;
    spend: string;
  }>`
    SELECT cr.id, cr.image_url,
      COUNT(DISTINCT i.id)::text AS impressions,
      COUNT(DISTINCT cl.id)::text AS clicks,
      (COALESCE(SUM(i.winning_bid), 0) / 1000)::text AS spend
    FROM creatives cr
    INNER JOIN campaigns c ON c.id = cr.campaign_id
    LEFT JOIN impressions i ON i.creative_id = cr.id AND i.created_at::date >= ${fromStr}::date AND i.created_at::date <= ${toStr}::date
    LEFT JOIN clicks cl ON cl.impression_id = i.id
    WHERE (LOWER(TRIM(COALESCE(c.advertiser_email, ''))) = ${emailMatch}
      OR LOWER(TRIM(COALESCE(c.contact_email, ''))) = ${emailMatch})
    AND cr.status <> 'archived'
    GROUP BY cr.id, cr.image_url
    HAVING COUNT(DISTINCT i.id) > 0
    ORDER BY COUNT(DISTINCT i.id) DESC
    LIMIT 12
  `;

  const topCreatives = topCreativesR.rows.map((r) => {
    const impressions = Number(r.impressions);
    const clicks = Number(r.clicks);
    return {
      creativeId: r.id,
      imageUrl: r.image_url,
      impressions,
      clicks,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      spend: Number(r.spend)
    };
  });
  topCreatives.sort((a, b) => b.ctr - a.ctr || b.impressions - a.impressions);

  const bud = await sql<{
    id: string;
    name: string;
    daily_budget: string | null;
    spend_today: string;
  }>`
    SELECT c.id,
      COALESCE(c.campaign_name, c.name, 'Campaign') AS name,
      c.daily_budget::text,
      (SELECT (COALESCE(SUM(i.winning_bid), 0) / 1000)::text FROM impressions i
        WHERE i.campaign_id = c.id AND i.created_at::date = CURRENT_DATE) AS spend_today
    FROM campaigns c
    WHERE LOWER(TRIM(COALESCE(c.advertiser_email, ''))) = ${emailMatch}
       OR LOWER(TRIM(COALESCE(c.contact_email, ''))) = ${emailMatch}
  `;

  const budgetUtilization = bud.rows.map((r) => {
    const db = r.daily_budget != null ? Number(r.daily_budget) : 0;
    const spent = Number(r.spend_today ?? 0);
    const utilizationPct = db > 0 ? Math.min(100, (spent / db) * 100) : 0;
    return {
      campaignId: r.id,
      name: r.name,
      dailyBudget: db,
      spendToday: spent,
      utilizationPct
    };
  });

  return { timeseries, topCreatives, budgetUtilization };
}
