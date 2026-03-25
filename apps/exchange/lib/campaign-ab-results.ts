import { sql } from "@/lib/db";

export type ABTestResults = {
  campaignId: string;
  testActive: boolean;
  variants: Array<{
    creativeId: string;
    creativeName: string;
    imageUrl: string;
    group: "a" | "b";
    weight: number;
    impressions: number;
    clicks: number;
    ctr: number;
    spend: number;
    winRate: number;
  }>;
  winner: string | null;
  confidence: number;
  recommendation: string;
  minimumSampleReached: boolean;
};

export function chiSquaredTest(ctrA: number, nA: number, ctrB: number, nB: number): number {
  if (nA < 100 || nB < 100) return 0;
  const expectedA = ((ctrA + ctrB) / 2) * nA;
  const expectedB = ((ctrA + ctrB) / 2) * nB;
  const chi2 =
    Math.pow(ctrA * nA - expectedA, 2) / Math.max(expectedA, 1e-9) +
    Math.pow(ctrB * nB - expectedB, 2) / Math.max(expectedB, 1e-9);
  return Math.min(99, chi2 * 15);
}

export async function buildAbResults(campaignId: string): Promise<ABTestResults | null> {
  const camp = await sql<{
    ab_test_active: boolean | null;
    ab_winner_creative_id: string | null;
  }>`
    SELECT ab_test_active, ab_winner_creative_id FROM campaigns WHERE id = ${campaignId} LIMIT 1
  `;
  const c = camp.rows[0];
  if (!c) return null;

  const creatives = await sql<{
    id: string;
    name: string;
    image_url: string | null;
    ab_group: string | null;
    ab_weight: string | null;
  }>`
    SELECT id, name, image_url, ab_group, ab_weight::text
    FROM creatives WHERE campaign_id = ${campaignId} AND status IN ('active', 'approved', 'paused')
  `;

  const variants: ABTestResults["variants"] = [];
  for (const cr of creatives.rows) {
    const imp = await sql<{ c: string; spend: string }>`
      SELECT COUNT(*)::text AS c, (COALESCE(SUM(winning_bid),0)/1000)::text AS spend
      FROM impressions WHERE campaign_id = ${campaignId} AND creative_id = ${cr.id}
        AND created_at >= now() - interval '30 days'
    `;
    const clk = await sql<{ c: string }>`
      SELECT COUNT(*)::text AS c FROM clicks ck
      INNER JOIN impressions i ON i.id = ck.impression_id
      WHERE i.campaign_id = ${campaignId} AND i.creative_id = ${cr.id}
        AND ck.created_at >= now() - interval '30 days'
    `;
    const impressions = Number(imp.rows[0]?.c ?? 0);
    const clicks = Number(clk.rows[0]?.c ?? 0);
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const spend = Number(imp.rows[0]?.spend ?? 0);
    const g = (cr.ab_group ?? "a").toLowerCase() === "b" ? "b" : "a";
    variants.push({
      creativeId: cr.id,
      creativeName: cr.name,
      imageUrl: cr.image_url ?? "",
      group: g,
      weight: Math.min(100, Math.max(0, Number(cr.ab_weight ?? 50))),
      impressions,
      clicks,
      ctr,
      spend,
      winRate: 0
    });
  }

  const totalImp = variants.reduce((s, v) => s + v.impressions, 0) || 1;
  for (const v of variants) {
    v.winRate = (v.impressions / totalImp) * 100;
  }

  const a = variants.find((v) => v.group === "a");
  const b = variants.find((v) => v.group === "b");
  let confidence = 0;
  let winner: string | null = c.ab_winner_creative_id;
  let recommendation = "Collect more data to compare variants.";
  const minimumSampleReached = variants.every((v) => v.impressions >= 1000);

  if (a && b && a.impressions >= 100 && b.impressions >= 100) {
    const ctrA = a.impressions > 0 ? a.clicks / a.impressions : 0;
    const ctrB = b.impressions > 0 ? b.clicks / b.impressions : 0;
    confidence = chiSquaredTest(ctrA, a.impressions, ctrB, b.impressions);
    if (confidence >= 95 && ctrA !== ctrB) {
      const win = ctrB > ctrA ? b : a;
      winner = win.creativeId;
      recommendation = `Creative ${win.group.toUpperCase()} has higher CTR with ~${confidence.toFixed(0)}% confidence. Consider pausing the other variant.`;
    }
  }

  return {
    campaignId,
    testActive: c.ab_test_active === true,
    variants,
    winner,
    confidence,
    recommendation,
    minimumSampleReached
  };
}
