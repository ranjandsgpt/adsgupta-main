import { demandAdvertiserFilter } from "@/lib/demand-scope";
import type { AuthContext } from "@/lib/require-auth";
import { sql } from "@/lib/db";

export type DashboardPayload = {
  scope: string;
  publisherId?: string;
  advertiser?: string;
  totalAuctions: number;
  totalImpressions: number;
  totalClicks: number;
  totalRevenue: number;
  ctr: number;
  recentAuctions: unknown[];
  /** Set when SQL fails (missing DB, tables, or connection). */
  loadError?: string;
};

function unavailablePayload(message: string, scope = "unavailable"): DashboardPayload {
  return {
    scope,
    totalAuctions: 0,
    totalImpressions: 0,
    totalClicks: 0,
    totalRevenue: 0,
    ctr: 0,
    recentAuctions: [],
    loadError: message
  };
}

async function loadDashboardPayload(auth: AuthContext): Promise<DashboardPayload | null> {
  if (auth.role === "admin") {
    const [auctions, impressions, clicks, revenue, recent] = await Promise.all([
      sql<{ count: string }>`SELECT COUNT(*)::text AS count FROM auction_log`,
      sql<{ count: string }>`SELECT COUNT(*)::text AS count FROM impressions`,
      sql<{ count: string }>`SELECT COUNT(*)::text AS count FROM clicks`,
      sql<{ revenue: string }>`SELECT COALESCE(SUM(winning_bid), 0)::text AS revenue FROM auction_log`,
      sql`SELECT auction_id, winning_bid, bid_count, created_at FROM auction_log ORDER BY created_at DESC LIMIT 20`
    ]);
    const imps = Number(impressions.rows[0]?.count ?? 0);
    return {
      scope: "exchange",
      totalAuctions: Number(auctions.rows[0]?.count ?? 0),
      totalImpressions: imps,
      totalClicks: Number(clicks.rows[0]?.count ?? 0),
      totalRevenue: Number(revenue.rows[0]?.revenue ?? 0),
      ctr: imps > 0 ? (Number(clicks.rows[0]?.count ?? 0) / imps) * 100 : 0,
      recentAuctions: recent.rows
    };
  }

  if (auth.role === "publisher") {
    if (!auth.publisherId) {
      return {
        scope: "publisher",
        totalAuctions: 0,
        totalImpressions: 0,
        totalClicks: 0,
        totalRevenue: 0,
        ctr: 0,
        recentAuctions: []
      };
    }
    const pid = auth.publisherId;
    const [auctions, impressions, clicks, revenue, recent] = await Promise.all([
      sql<{ count: string }>`SELECT COUNT(*)::text AS count FROM auction_log WHERE publisher_id = ${pid}`,
      sql<{ count: string }>`
        SELECT COUNT(*)::text AS count FROM impressions i
        JOIN ad_units u ON u.id = i.ad_unit_id
        WHERE u.publisher_id = ${pid}
      `,
      sql<{ count: string }>`
        SELECT COUNT(*)::text AS count FROM clicks k
        JOIN impressions i ON i.id = k.impression_id
        JOIN ad_units u ON u.id = i.ad_unit_id
        WHERE u.publisher_id = ${pid}
      `,
      sql<{ revenue: string }>`
        SELECT COALESCE(SUM(winning_bid), 0)::text AS revenue FROM auction_log WHERE publisher_id = ${pid}
      `,
      sql`
        SELECT auction_id, winning_bid, bid_count, created_at
        FROM auction_log
        WHERE publisher_id = ${pid}
        ORDER BY created_at DESC
        LIMIT 20
      `
    ]);
    const imps = Number(impressions.rows[0]?.count ?? 0);
    return {
      scope: "publisher",
      publisherId: pid,
      totalAuctions: Number(auctions.rows[0]?.count ?? 0),
      totalImpressions: imps,
      totalClicks: Number(clicks.rows[0]?.count ?? 0),
      totalRevenue: Number(revenue.rows[0]?.revenue ?? 0),
      ctr: imps > 0 ? (Number(clicks.rows[0]?.count ?? 0) / imps) * 100 : 0,
      recentAuctions: recent.rows
    };
  }

  if (auth.role === "demand") {
    const adv = demandAdvertiserFilter(auth);
    if (!adv) {
      const [auctions, impressions, clicks, revenue, recent] = await Promise.all([
        sql<{ count: string }>`
          SELECT COUNT(*)::text AS count FROM auction_log WHERE winning_campaign_id IS NOT NULL
        `,
        sql<{ count: string }>`SELECT COUNT(*)::text AS count FROM impressions WHERE campaign_id IS NOT NULL`,
        sql<{ count: string }>`SELECT COUNT(*)::text AS count FROM clicks WHERE campaign_id IS NOT NULL`,
        sql<{ revenue: string }>`
          SELECT COALESCE(SUM(winning_bid), 0)::text AS revenue
          FROM auction_log WHERE winning_campaign_id IS NOT NULL
        `,
        sql`
          SELECT auction_id, winning_bid, bid_count, created_at
          FROM auction_log
          WHERE winning_campaign_id IS NOT NULL
          ORDER BY created_at DESC
          LIMIT 20
        `
      ]);
      const imps = Number(impressions.rows[0]?.count ?? 0);
      return {
        scope: "demand",
        totalAuctions: Number(auctions.rows[0]?.count ?? 0),
        totalImpressions: imps,
        totalClicks: Number(clicks.rows[0]?.count ?? 0),
        totalRevenue: Number(revenue.rows[0]?.revenue ?? 0),
        ctr: imps > 0 ? (Number(clicks.rows[0]?.count ?? 0) / imps) * 100 : 0,
        recentAuctions: recent.rows
      };
    }

    const [auctions, impressions, clicks, revenue, recent] = await Promise.all([
      sql<{ count: string }>`
        SELECT COUNT(*)::text AS count FROM auction_log al
        JOIN campaigns c ON c.id = al.winning_campaign_id
        WHERE COALESCE(c.advertiser_name, c.advertiser) = ${adv}
      `,
      sql<{ count: string }>`
        SELECT COUNT(*)::text AS count FROM impressions i
        JOIN campaigns c ON c.id = i.campaign_id
        WHERE COALESCE(c.advertiser_name, c.advertiser) = ${adv}
      `,
      sql<{ count: string }>`
        SELECT COUNT(*)::text AS count FROM clicks k
        JOIN campaigns c ON c.id = k.campaign_id
        WHERE COALESCE(c.advertiser_name, c.advertiser) = ${adv}
      `,
      sql<{ revenue: string }>`
        SELECT COALESCE(SUM(al.winning_bid), 0)::text AS revenue
        FROM auction_log al
        JOIN campaigns c ON c.id = al.winning_campaign_id
        WHERE COALESCE(c.advertiser_name, c.advertiser) = ${adv}
      `,
      sql`
        SELECT al.auction_id, al.winning_bid, al.bid_count, al.created_at
        FROM auction_log al
        JOIN campaigns c ON c.id = al.winning_campaign_id
        WHERE COALESCE(c.advertiser_name, c.advertiser) = ${adv}
        ORDER BY al.created_at DESC
        LIMIT 20
      `
    ]);
    const imps = Number(impressions.rows[0]?.count ?? 0);
    return {
      scope: "demand",
      advertiser: adv,
      totalAuctions: Number(auctions.rows[0]?.count ?? 0),
      totalImpressions: imps,
      totalClicks: Number(clicks.rows[0]?.count ?? 0),
      totalRevenue: Number(revenue.rows[0]?.revenue ?? 0),
      ctr: imps > 0 ? (Number(clicks.rows[0]?.count ?? 0) / imps) * 100 : 0,
      recentAuctions: recent.rows
    };
  }

  return null;
}

/**
 * Never throws — avoids Next.js production “Application error” when Postgres or schema is missing.
 */
export async function getDashboardPayload(auth: AuthContext): Promise<DashboardPayload | null> {
  try {
    return await loadDashboardPayload(auth);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[exchange] dashboard query failed:", err);
    const hint =
      /relation .* does not exist/i.test(message) || /does not exist/i.test(message)
        ? `${message} — Run GET /api/db-init?secret=YOUR_DB_INIT_SECRET once to create tables.`
        : message;
    return unavailablePayload(hint);
  }
}
