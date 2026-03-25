import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role !== "admin") return forbidden();

  try {
    const [publishers, campaigns, creatives, budgetExhausted] = await Promise.all([
      sql<{ c: string }>`SELECT COUNT(*)::text AS c FROM publishers WHERE status = 'pending'`,
      sql<{ c: string }>`SELECT COUNT(*)::text AS c FROM campaigns WHERE status = 'pending'`,
      sql<{ c: string }>`
        SELECT COUNT(*)::text AS c FROM creatives
        WHERE COALESCE(scan_passed, true) = false AND status = 'active'
      `,
      sql<{ c: string }>`SELECT COUNT(*)::text AS c FROM campaigns WHERE status = 'budget_exhausted'`
    ]);

    const pendingPublishers = Number(publishers.rows[0]?.c ?? 0);
    const pendingCampaigns = Number(campaigns.rows[0]?.c ?? 0);
    const flaggedCreatives = Number(creatives.rows[0]?.c ?? 0);
    const exhaustedBudgets = Number(budgetExhausted.rows[0]?.c ?? 0);

    if (pendingPublishers > 0) {
      void sql`
        INSERT INTO admin_notifications (type, message, entity_type)
        VALUES (
          'pending_publisher',
          ${pendingPublishers + " publisher(s) awaiting activation"},
          'publisher'
        )
      `.catch(() => {});
    }
    if (pendingCampaigns > 0) {
      void sql`
        INSERT INTO admin_notifications (type, message, entity_type)
        VALUES (
          'pending_campaign',
          ${pendingCampaigns + " campaign(s) awaiting review"},
          'campaign'
        )
      `.catch(() => {});
    }

    return json({
      pendingPublishers,
      pendingCampaigns,
      flaggedCreatives,
      exhaustedBudgets,
      total: pendingPublishers + pendingCampaigns + flaggedCreatives + exhaustedBudgets
    });
  } catch (e) {
    console.error("[admin/needs-action]", e);
    return json(
      {
        pendingPublishers: 0,
        pendingCampaigns: 0,
        flaggedCreatives: 0,
        exhaustedBudgets: 0,
        total: 0
      },
      { status: 200 }
    );
  }
}
