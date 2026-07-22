export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";

const DEMO_DOMAIN = "demo-serving.adsgupta.com";

/** Public read-only lookup for the persistent demo publisher/ad unit (if seeded). */
export async function GET() {
  try {
    const pub = await sql<{ id: string }>`
      SELECT id::text AS id FROM publishers
      WHERE domain = ${DEMO_DOMAIN} AND status = 'active'
      LIMIT 1
    `;
    const publisherId = pub.rows[0]?.id;
    if (!publisherId) {
      return json({ ok: false, ready: false, hint: "Run GET /api/demo/setup?secret=... to seed demo inventory" });
    }

    const unit = await sql<{ id: string }>`
      SELECT id::text AS id FROM ad_units
      WHERE publisher_id = ${publisherId}::uuid AND status = 'active'
      ORDER BY created_at ASC
      LIMIT 1
    `;
    const adUnitId = unit.rows[0]?.id;
    if (!adUnitId) {
      return json({ ok: false, ready: false, publisherId, hint: "Demo publisher exists but no active ad unit" });
    }

    return json({ ok: true, ready: true, publisherId, adUnitId, domain: DEMO_DOMAIN });
  } catch (e) {
    console.error("[demo/ids]", e);
    return json({ ok: false, error: e instanceof Error ? e.message : String(e) }, 500);
  }
}
