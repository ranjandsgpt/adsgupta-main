export const dynamic = "force-dynamic";
import { getCampaignSpendToday } from "@/lib/budget-check";
import { demandAdvertiserFilter } from "@/lib/demand-scope";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

async function loadCampaign(id: string) {
  try {
    const result = await sql`
      SELECT id, daily_budget::text, advertiser_name, advertiser
      FROM campaigns
      WHERE id = ${id}
      LIMIT 1
    `;
    return result.rows[0] as
      | {
          id: string;
          daily_budget: string | null;
          advertiser_name: string | null;
          advertiser: string | null;
        }
      | undefined;
  } catch (e) {
    console.error("[campaign stats load]", e);
    return undefined;
  }
}

function advertiserKey(campaign: NonNullable<Awaited<ReturnType<typeof loadCampaign>>>): string {
  return String(campaign.advertiser_name ?? campaign.advertiser ?? "");
}

function canDemandAccessCampaign(
  auth: Awaited<ReturnType<typeof getAuthFromRequest>>,
  campaign: NonNullable<Awaited<ReturnType<typeof loadCampaign>>>
): boolean {
  if (!auth) return false;
  if (auth.role !== "demand") return true;
  const adv = demandAdvertiserFilter(auth);
  if (!adv) return true;
  return advertiserKey(campaign) === adv;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();

  const campaign = await loadCampaign(params.id);
  if (!campaign) return json(null, 404);

  if (auth.role === "publisher") return forbidden();
  if (!canDemandAccessCampaign(auth, campaign)) return forbidden();

  const budgetRaw = campaign.daily_budget != null ? Number(campaign.daily_budget) : NaN;
  const dailyBudget = Number.isFinite(budgetRaw) ? budgetRaw : 0;

  const spendToday = await getCampaignSpendToday(params.id);
  const remainingBudget = dailyBudget > 0 ? Math.max(0, dailyBudget - spendToday) : null;

  const imps = await sql<{ c: string }>`
    SELECT COUNT(*)::text AS c
    FROM impressions
    WHERE campaign_id = ${params.id}
      AND created_at::date = CURRENT_DATE
  `;
  const impressionsToday = Number(imps.rows[0]?.c ?? 0);

  const clk = await sql<{ c: string }>`
    SELECT COUNT(*)::text AS c
    FROM clicks
    WHERE campaign_id = ${params.id}
      AND created_at::date = CURRENT_DATE
  `;
  const clicksToday = Number(clk.rows[0]?.c ?? 0);

  const ctr = impressionsToday > 0 ? (clicksToday / impressionsToday) * 100 : 0;
  const avgCpm = impressionsToday > 0 ? (spendToday / impressionsToday) * 1000 : 0;

  return json({
    campaignId: params.id,
    spendToday,
    dailyBudget,
    remainingBudget,
    impressionsToday,
    clicksToday,
    ctr,
    avgCpm
  });
}
