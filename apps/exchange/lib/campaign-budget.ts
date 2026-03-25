import { sql } from "@/lib/db";
import { fireWebhooksAsync } from "@/lib/webhooks";

/** When daily spend meets or exceeds daily_budget, pause campaign and notify. */
export async function checkBudgetAndPause(campaignId: string, impressionCost: number): Promise<void> {
  void impressionCost;
  const campaign = await sql<{ daily_budget: string | null; spend_today: string | null }>`
    SELECT daily_budget::text, spend_today::text FROM campaigns WHERE id = ${campaignId} LIMIT 1
  `;
  if (!campaign.rows.length) return;
  const c = campaign.rows[0]!;
  if (c.daily_budget == null) return;
  const budget = Number(c.daily_budget);
  const spent = Number(c.spend_today ?? 0);
  if (!Number.isFinite(budget) || budget <= 0) return;
  if (spent < budget) return;

  await sql`UPDATE campaigns SET status = 'budget_exhausted' WHERE id = ${campaignId}`;
  await sql`
    INSERT INTO admin_notifications (type, message, entity_type, entity_id)
    VALUES (
      'budget_exhausted',
      ${"Campaign " + campaignId + " has exhausted its daily budget of $" + c.daily_budget},
      'campaign',
      ${campaignId}
    )
  `.catch(() => {});
  fireWebhooksAsync("campaign.budget_exhausted", { campaignId, dailyBudget: Number(c.daily_budget) });
  console.log("[budget] campaign", campaignId, "budget exhausted, paused");
}
