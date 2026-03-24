import { sql } from "@/lib/db";

/**
 * Spend today in account currency: sum of clearing CPMs recorded on impressions, divided by 1000
 * (treats winning_bid as CPM dollars for the impression).
 */
export async function getCampaignSpendToday(campaignId: string): Promise<number> {
  try {
    const result = await sql<{ spend: string }>`
      SELECT (COALESCE(SUM(winning_bid), 0) / 1000)::text AS spend
      FROM impressions
      WHERE campaign_id = ${campaignId}
        AND created_at::date = CURRENT_DATE
    `;
    return Number(result.rows[0]?.spend ?? 0);
  } catch (e) {
    console.error("[budget-check] getCampaignSpendToday", e);
    throw e;
  }
}

export async function isCampaignOverBudget(campaignId: string, dailyBudget: number): Promise<boolean> {
  if (dailyBudget == null || dailyBudget <= 0 || Number.isNaN(dailyBudget)) return false;
  const spend = await getCampaignSpendToday(campaignId);
  return spend >= dailyBudget;
}

export async function getRemainingBudget(campaignId: string, dailyBudget: number): Promise<number> {
  if (dailyBudget == null || dailyBudget <= 0 || Number.isNaN(dailyBudget)) {
    return Number.POSITIVE_INFINITY;
  }
  const spend = await getCampaignSpendToday(campaignId);
  return Math.max(0, dailyBudget - spend);
}
