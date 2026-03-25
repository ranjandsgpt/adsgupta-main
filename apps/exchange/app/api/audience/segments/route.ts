export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { NextRequest } from "next/server";

/**
 * Publishers that have retargeting pixel activity, with rough reach estimate.
 */
export async function GET(_request: NextRequest) {
  try {
    const result = await sql`
      SELECT
        p.id AS publisher_id,
        p.name,
        p.domain,
        COUNT(re.id)::int AS event_count,
        COUNT(DISTINCT date_trunc('day', re.created_at))::int AS active_days
      FROM retargeting_events re
      INNER JOIN publishers p ON p.id = re.publisher_id
      GROUP BY p.id, p.name, p.domain
      ORDER BY event_count DESC
      LIMIT 100
    `;

    const segments = result.rows.map((r) => ({
      publisherId: String(r.publisher_id),
      name: String(r.name),
      domain: String(r.domain),
      estimatedReach: Math.max(100, Number(r.event_count) * 50),
      eventCount: Number(r.event_count)
    }));

    return json({ segments });
  } catch (e) {
    console.error("[audience/segments]", e);
    return json({ segments: [] });
  }
}
