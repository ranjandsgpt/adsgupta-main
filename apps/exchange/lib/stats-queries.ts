import { getDb } from "@/lib/db";

export type TopUnitRow = {
  unitId: string;
  unitName: string;
  impressions: number;
  revenue: number;
  fillRate: number;
};

export type ExchangeStatsPayload = {
  publisherId: string | null;
  impressionsTotal: number;
  impressionsToday: number;
  clicksTotal: number;
  clicksToday: number;
  revenueTotal: number;
  revenueToday: number;
  fillRate: number;
  fillRateToday: number;
  avgCpm: number;
  avgCpmToday: number;
  activeUnits: number;
  totalAuctions: number;
  totalAuctionsToday: number;
  topUnits: TopUnitRow[];
};

async function queryNumber(fn: () => Promise<unknown>): Promise<number> {
  const r = await fn();
  const arr = Array.isArray(r) ? r : [];
  const row = arr[0] as { v?: string } | undefined;
  return Number(row?.v ?? 0);
}

/** Exchange-wide or publisher-scoped metrics using Neon tagged template client. */
export async function computeExchangeStats(publisherId: string | null): Promise<ExchangeStatsPayload> {
  const db = getDb();
  const pid = publisherId;

  let impressionsTotal: number;
  let impressionsToday: number;
  let revenueTotal: number;
  let revenueToday: number;
  let clicksTotal: number;
  let clicksToday: number;

  if (pid) {
    impressionsTotal = await queryNumber(() =>
      db`
        SELECT COUNT(*)::text AS v
        FROM impressions i
        INNER JOIN ad_units u ON u.id = i.ad_unit_id
        WHERE u.publisher_id = ${pid} AND u.status <> 'archived'
      `
    );
    impressionsToday = await queryNumber(() =>
      db`
        SELECT COUNT(*)::text AS v
        FROM impressions i
        INNER JOIN ad_units u ON u.id = i.ad_unit_id
        WHERE u.publisher_id = ${pid} AND u.status <> 'archived'
          AND i.created_at::date = CURRENT_DATE
      `
    );
    revenueTotal = await queryNumber(() =>
      db`
        SELECT (COALESCE(SUM(i.winning_bid), 0) / 1000)::text AS v
        FROM impressions i
        INNER JOIN ad_units u ON u.id = i.ad_unit_id
        WHERE u.publisher_id = ${pid} AND u.status <> 'archived'
      `
    );
    revenueToday = await queryNumber(() =>
      db`
        SELECT (COALESCE(SUM(i.winning_bid), 0) / 1000)::text AS v
        FROM impressions i
        INNER JOIN ad_units u ON u.id = i.ad_unit_id
        WHERE u.publisher_id = ${pid} AND u.status <> 'archived'
          AND i.created_at::date = CURRENT_DATE
      `
    );
    clicksTotal = await queryNumber(() =>
      db`
        SELECT COUNT(*)::text AS v
        FROM clicks c
        INNER JOIN impressions i ON i.id = c.impression_id
        INNER JOIN ad_units u ON u.id = i.ad_unit_id
        WHERE u.publisher_id = ${pid} AND u.status <> 'archived'
      `
    );
    clicksToday = await queryNumber(() =>
      db`
        SELECT COUNT(*)::text AS v
        FROM clicks c
        INNER JOIN impressions i ON i.id = c.impression_id
        INNER JOIN ad_units u ON u.id = i.ad_unit_id
        WHERE u.publisher_id = ${pid} AND u.status <> 'archived'
          AND c.created_at::date = CURRENT_DATE
      `
    );
  } else {
    impressionsTotal = await queryNumber(() => db`SELECT COUNT(*)::text AS v FROM impressions`);
    impressionsToday = await queryNumber(() =>
      db`SELECT COUNT(*)::text AS v FROM impressions WHERE created_at::date = CURRENT_DATE`
    );
    revenueTotal = await queryNumber(() =>
      db`SELECT (COALESCE(SUM(winning_bid), 0) / 1000)::text AS v FROM impressions`
    );
    revenueToday = await queryNumber(() =>
      db`
        SELECT (COALESCE(SUM(winning_bid), 0) / 1000)::text AS v
        FROM impressions
        WHERE created_at::date = CURRENT_DATE
      `
    );
    clicksTotal = await queryNumber(() => db`SELECT COUNT(*)::text AS v FROM clicks`);
    clicksToday = await queryNumber(() =>
      db`SELECT COUNT(*)::text AS v FROM clicks WHERE created_at::date = CURRENT_DATE`
    );
  }

  let totalAuctions: number;
  let totalCleared: number;
  let totalAuctionsToday: number;
  let totalClearedToday: number;
  let avgCpm: number;
  let avgCpmToday: number;
  let activeUnits: number;

  if (pid) {
    totalAuctions = await queryNumber(() =>
      db`SELECT COUNT(*)::text AS v FROM auction_log WHERE publisher_id = ${pid}`
    );
    totalCleared = await queryNumber(() =>
      db`
        SELECT COUNT(*)::text AS v
        FROM auction_log
        WHERE publisher_id = ${pid} AND cleared = true AND winning_campaign_id IS NOT NULL
      `
    );
    totalAuctionsToday = await queryNumber(() =>
      db`
        SELECT COUNT(*)::text AS v
        FROM auction_log
        WHERE publisher_id = ${pid} AND created_at::date = CURRENT_DATE
      `
    );
    totalClearedToday = await queryNumber(() =>
      db`
        SELECT COUNT(*)::text AS v
        FROM auction_log
        WHERE publisher_id = ${pid}
          AND created_at::date = CURRENT_DATE
          AND cleared = true
          AND winning_campaign_id IS NOT NULL
      `
    );
    avgCpm = await queryNumber(() =>
      db`
        SELECT COALESCE(AVG(winning_bid), 0)::text AS v
        FROM auction_log
        WHERE publisher_id = ${pid} AND cleared = true AND winning_bid IS NOT NULL
      `
    );
    avgCpmToday = await queryNumber(() =>
      db`
        SELECT COALESCE(AVG(winning_bid), 0)::text AS v
        FROM auction_log
        WHERE publisher_id = ${pid}
          AND cleared = true
          AND winning_bid IS NOT NULL
          AND created_at::date = CURRENT_DATE
      `
    );
    activeUnits = await queryNumber(() =>
      db`
        SELECT COUNT(*)::text AS v
        FROM ad_units
        WHERE publisher_id = ${pid} AND status = 'active'
      `
    );
  } else {
    totalAuctions = await queryNumber(() => db`SELECT COUNT(*)::text AS v FROM auction_log`);
    totalCleared = await queryNumber(() =>
      db`
        SELECT COUNT(*)::text AS v
        FROM auction_log
        WHERE cleared = true AND winning_campaign_id IS NOT NULL
      `
    );
    totalAuctionsToday = await queryNumber(() =>
      db`SELECT COUNT(*)::text AS v FROM auction_log WHERE created_at::date = CURRENT_DATE`
    );
    totalClearedToday = await queryNumber(() =>
      db`
        SELECT COUNT(*)::text AS v
        FROM auction_log
        WHERE created_at::date = CURRENT_DATE
          AND cleared = true
          AND winning_campaign_id IS NOT NULL
      `
    );
    avgCpm = await queryNumber(() =>
      db`
        SELECT COALESCE(AVG(winning_bid), 0)::text AS v
        FROM auction_log
        WHERE cleared = true AND winning_bid IS NOT NULL
      `
    );
    avgCpmToday = await queryNumber(() =>
      db`
        SELECT COALESCE(AVG(winning_bid), 0)::text AS v
        FROM auction_log
        WHERE cleared = true
          AND winning_bid IS NOT NULL
          AND created_at::date = CURRENT_DATE
      `
    );
    activeUnits = await queryNumber(() =>
      db`SELECT COUNT(*)::text AS v FROM ad_units WHERE status = 'active'`
    );
  }

  const fillRate = totalAuctions > 0 ? (totalCleared / totalAuctions) * 100 : 0;
  const fillRateToday = totalAuctionsToday > 0 ? (totalClearedToday / totalAuctionsToday) * 100 : 0;

  let topRowsArr: unknown;

  if (pid) {
    topRowsArr = await db`
      WITH agg AS (
        SELECT
          u.id AS unit_id,
          u.name AS unit_name,
          (SELECT COUNT(*)::text FROM impressions i WHERE i.ad_unit_id = u.id) AS imp_cnt,
          (SELECT (COALESCE(SUM(winning_bid), 0) / 1000)::text FROM impressions i WHERE i.ad_unit_id = u.id) AS rev,
          (SELECT COUNT(*)::text FROM auction_log al WHERE al.ad_unit_id = u.id) AS auc_total,
          (
            SELECT COUNT(*)::text
            FROM auction_log al
            WHERE al.ad_unit_id = u.id AND al.cleared = true AND al.winning_campaign_id IS NOT NULL
          ) AS auc_cleared
        FROM ad_units u
        WHERE u.publisher_id = ${pid} AND u.status <> 'archived'
      )
      SELECT * FROM agg
      ORDER BY COALESCE(rev::numeric, 0) DESC NULLS LAST
      LIMIT 5
    `;
  } else {
    topRowsArr = await db`
      WITH agg AS (
        SELECT
          u.id AS unit_id,
          u.name AS unit_name,
          (SELECT COUNT(*)::text FROM impressions i WHERE i.ad_unit_id = u.id) AS imp_cnt,
          (SELECT (COALESCE(SUM(winning_bid), 0) / 1000)::text FROM impressions i WHERE i.ad_unit_id = u.id) AS rev,
          (SELECT COUNT(*)::text FROM auction_log al WHERE al.ad_unit_id = u.id) AS auc_total,
          (
            SELECT COUNT(*)::text
            FROM auction_log al
            WHERE al.ad_unit_id = u.id AND al.cleared = true AND al.winning_campaign_id IS NOT NULL
          ) AS auc_cleared
        FROM ad_units u
        WHERE u.status <> 'archived'
      )
      SELECT * FROM agg
      ORDER BY COALESCE(rev::numeric, 0) DESC NULLS LAST
      LIMIT 5
    `;
  }

  const topRows = Array.isArray(topRowsArr) ? topRowsArr : [];
  const topUnits: TopUnitRow[] = topRows.map((row) => {
    const r = row as {
      unit_id: string;
      unit_name: string;
      imp_cnt: string;
      rev: string;
      auc_total: string;
      auc_cleared: string;
    };
    const aucTotal = Number(r.auc_total ?? 0);
    const aucCleared = Number(r.auc_cleared ?? 0);
    return {
      unitId: r.unit_id,
      unitName: r.unit_name,
      impressions: Number(r.imp_cnt ?? 0),
      revenue: Number(r.rev ?? 0),
      fillRate: aucTotal > 0 ? (aucCleared / aucTotal) * 100 : 0
    };
  });

  return {
    publisherId: pid,
    impressionsTotal,
    impressionsToday,
    clicksTotal,
    clicksToday,
    revenueTotal,
    revenueToday,
    fillRate,
    fillRateToday,
    avgCpm,
    avgCpmToday,
    activeUnits,
    totalAuctions,
    totalAuctionsToday,
    topUnits
  };
}
