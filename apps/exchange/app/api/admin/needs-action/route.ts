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
    const [pendingPublishers, pendingCampaigns, flaggedCreatives] = await Promise.all([
      sql<{ c: string }>`SELECT COUNT(*)::text AS c FROM publishers WHERE status = 'pending'`,
      sql<{ c: string }>`SELECT COUNT(*)::text AS c FROM campaigns WHERE status = 'pending'`,
      sql<{ c: string }>`SELECT COUNT(*)::text AS c FROM creatives WHERE status = 'flagged'`
    ]);

    return json({
      pendingPublishers: Number(pendingPublishers.rows[0]?.c ?? 0),
      pendingCampaigns: Number(pendingCampaigns.rows[0]?.c ?? 0),
      flaggedCreatives: Number(flaggedCreatives.rows[0]?.c ?? 0)
    });
  } catch (e) {
    console.error("[admin/needs-action]", e);
    return json(
      {
        pendingPublishers: 0,
        pendingCampaigns: 0,
        flaggedCreatives: 0
      },
      { status: 200 }
    );
  }
}

