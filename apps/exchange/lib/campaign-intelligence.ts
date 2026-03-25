import { sql } from "@/lib/db";

export type CampaignIntelligencePayload = {
  campaignId: string;
  period: string;
  performance: {
    totalBidsEntered: number;
    totalBidsWon: number;
    winRate: number;
    avgWinningBid: number;
    avgCompetitorBid: number;
    lowestWinningBid: number;
    highestLosingBid: number;
  };
  bidRecommendation: {
    currentBid: number;
    recommendedBid: number;
    reasoning: string;
    projectedWinRate: number;
    projectedDailyImpressions: number;
    projectedDailySpend: number;
  };
  bestPerformingUnits: Array<{
    unitId: string;
    publisherDomain: string;
    winRate: number;
    avgCpm: number;
    impressions: number;
  }>;
  hourlyPerformance: Array<{ hour: number; impressions: number; winRate: number }>;
};

export function recommendBidPrice(currentBid: number, winRate: number): {
  recommendedBid: number;
  reasoning: string;
  projectedWinRate: number;
} {
  let recommendedBid = currentBid;
  let reasoning = "";
  let projectedWinRate = winRate;

  if (winRate < 20) {
    recommendedBid = currentBid * 1.3;
    reasoning = `Win rate under 20%. Raising bid ~30% may improve auction participation.`;
    projectedWinRate = Math.min(95, winRate * 1.75);
  } else if (winRate > 80) {
    recommendedBid = currentBid * 0.85;
    reasoning = `Win rate over 80% — you may be overpaying; a ~15% lower bid can preserve most wins.`;
    projectedWinRate = Math.max(winRate * 0.92, 40);
  } else if (winRate >= 40 && winRate <= 60) {
    reasoning = `Win rate in the 40–60% range — bid is in a balanced zone.`;
    projectedWinRate = winRate;
  } else if (winRate > 60 && winRate <= 80) {
    recommendedBid = currentBid * 0.95;
    reasoning = `Win rate 60–80% — a small decrease may trim spend with limited loss.`;
    projectedWinRate = winRate * 0.97;
  } else {
    recommendedBid = currentBid * 1.1;
    reasoning = `Win rate 20–40% — a modest bid increase may lift win rate.`;
    projectedWinRate = Math.min(85, winRate * 1.35);
  }

  recommendedBid = Math.max(0.1, Math.min(50, recommendedBid));
  return { recommendedBid, reasoning, projectedWinRate };
}

export async function buildCampaignIntelligence(campaignId: string): Promise<CampaignIntelligencePayload | null> {
  const camp = await sql<{
    bid_price: string;
    target_sizes: string[] | null;
  }>`
    SELECT bid_price::text, target_sizes FROM campaigns WHERE id = ${campaignId} LIMIT 1
  `;
  const c = camp.rows[0];
  if (!c) return null;

  const currentBid = Number(c.bid_price);
  const sizes = c.target_sizes?.length ? c.target_sizes : ["300x250"];

  const won = await sql<{ c: string }>`
    SELECT COUNT(*)::text AS c FROM auction_log
    WHERE winning_campaign_id = ${campaignId}
      AND created_at >= now() - interval '7 days'
  `;
  const totalBidsWon = Number(won.rows[0]?.c ?? 0);

  const entered = await sql<{ c: string }>`
    SELECT COUNT(*)::text AS c
    FROM auction_log al
    INNER JOIN ad_units u ON u.id = al.ad_unit_id
    WHERE al.created_at >= now() - interval '7 days'
      AND u.sizes && ${sizes}
  `;
  const totalBidsEntered = Math.max(Number(entered.rows[0]?.c ?? 0), 1);
  const winRate = totalBidsEntered > 0 ? (totalBidsWon / totalBidsEntered) * 100 : 0;

  const avgWin = await sql<{ v: string | null }>`
    SELECT AVG(winning_bid)::text AS v FROM auction_log
    WHERE winning_campaign_id = ${campaignId}
      AND winning_bid IS NOT NULL
      AND created_at >= now() - interval '7 days'
  `;
  const avgWinningBid = Number(avgWin.rows[0]?.v ?? 0);

  const avgComp = await sql<{ v: string | null }>`
    SELECT AVG(al.winning_bid)::text AS v
    FROM auction_log al
    INNER JOIN ad_units u ON u.id = al.ad_unit_id
    WHERE al.created_at >= now() - interval '7 days'
      AND al.winning_campaign_id IS NOT NULL
      AND al.winning_campaign_id <> ${campaignId}
      AND u.sizes && ${sizes}
  `;
  const avgCompetitorBid = Number(avgComp.rows[0]?.v ?? 0);

  const lowWin = await sql<{ v: string | null }>`
    SELECT MIN(winning_bid)::text AS v FROM auction_log
    WHERE winning_campaign_id = ${campaignId}
      AND winning_bid IS NOT NULL
      AND created_at >= now() - interval '7 days'
  `;
  const lowestWinningBid = Number(lowWin.rows[0]?.v ?? 0);

  const highLoss = await sql<{ v: string | null }>`
    SELECT MAX(al.winning_bid)::text AS v
    FROM auction_log al
    INNER JOIN ad_units u ON u.id = al.ad_unit_id
    WHERE al.created_at >= now() - interval '7 days'
      AND al.winning_campaign_id IS NOT NULL
      AND al.winning_campaign_id <> ${campaignId}
      AND u.sizes && ${sizes}
  `;
  const highestLosingBid = Number(highLoss.rows[0]?.v ?? 0);

  const { recommendedBid, reasoning, projectedWinRate } = recommendBidPrice(currentBid, winRate);

  const winsPerDay = totalBidsWon / 7;
  const projectedDailyImpressions = Math.round(winsPerDay * (projectedWinRate / Math.max(winRate, 0.01)));
  const projectedDailySpend = (projectedDailyImpressions / 1000) * recommendedBid;

  const totalImpr = await sql<{ c: string }>`
    SELECT COUNT(*)::text AS c FROM impressions i
    WHERE i.campaign_id = ${campaignId} AND i.created_at >= now() - interval '7 days'
  `;
  const totalImpN = Math.max(Number(totalImpr.rows[0]?.c ?? 0), 1);

  const units = await sql<{
    unit_id: string;
    domain: string;
    impressions: string;
    avg_cpm: string | null;
  }>`
    SELECT
      u.id AS unit_id,
      p.domain,
      COUNT(i.id)::text AS impressions,
      (COALESCE(AVG(i.winning_bid), 0))::text AS avg_cpm
    FROM impressions i
    INNER JOIN ad_units u ON u.id = i.ad_unit_id
    INNER JOIN publishers p ON p.id = u.publisher_id
    WHERE i.campaign_id = ${campaignId}
      AND i.created_at >= now() - interval '7 days'
    GROUP BY u.id, p.domain
    ORDER BY COUNT(i.id) DESC
    LIMIT 12
  `;

  const bestPerformingUnits = units.rows.map((r) => {
    const impr = Number(r.impressions);
    const avgCpm = Number(r.avg_cpm ?? 0);
    return {
      unitId: r.unit_id,
      publisherDomain: r.domain,
      winRate: (impr / totalImpN) * 100,
      avgCpm,
      impressions: impr
    };
  });

  const hourly = await sql<{ h: string; impressions: string }>`
    SELECT
      EXTRACT(HOUR FROM i.created_at AT TIME ZONE 'UTC')::int::text AS h,
      COUNT(*)::text AS impressions
    FROM impressions i
    WHERE i.created_at >= now() - interval '7 days'
      AND i.campaign_id = ${campaignId}
    GROUP BY EXTRACT(HOUR FROM i.created_at AT TIME ZONE 'UTC')
    ORDER BY 1
  `;
  const hMap = new Map<number, number>();
  for (const row of hourly.rows) {
    hMap.set(Number(row.h), Number(row.impressions));
  }
  const maxH = Math.max(1, ...Array.from(hMap.values()));
  const hourlyPerformance: Array<{ hour: number; impressions: number; winRate: number }> = [];
  for (let hour = 0; hour < 24; hour++) {
    const impressions = hMap.get(hour) ?? 0;
    hourlyPerformance.push({
      hour,
      impressions,
      winRate: maxH > 0 ? (impressions / maxH) * 100 : 0
    });
  }

  return {
    campaignId,
    period: "last 7 days",
    performance: {
      totalBidsEntered,
      totalBidsWon,
      winRate,
      avgWinningBid,
      avgCompetitorBid,
      lowestWinningBid,
      highestLosingBid
    },
    bidRecommendation: {
      currentBid,
      recommendedBid,
      reasoning,
      projectedWinRate,
      projectedDailyImpressions,
      projectedDailySpend
    },
    bestPerformingUnits,
    hourlyPerformance
  };
}
