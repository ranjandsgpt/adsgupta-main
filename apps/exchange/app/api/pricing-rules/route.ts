export const dynamic = "force-dynamic";
import { logAdminActivity } from "@/lib/admin-events";
import { clearPricingRulesCache } from "@/lib/floor-engine";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth) return unauthorized();
    if (auth.role !== "admin") return forbidden();

    const result = await sql<Record<string, unknown> & { match_count_7d?: string }>`
      SELECT
        pr.*,
        (
          SELECT COUNT(*)::text
          FROM auction_log al
          WHERE al.created_at > now() - interval '7 days'
            AND al.floor_price IS NOT NULL
            AND ABS(al.floor_price - pr.floor_cpm) < 0.001
        ) AS match_count_7d
      FROM pricing_rules pr
      ORDER BY pr.priority DESC NULLS LAST, pr.created_at DESC
    `;
    const rows = result.rows.map((r) => ({
      ...r,
      match_count_7d: Number(r.match_count_7d ?? 0)
    }));
    return json(rows);
  } catch (e) {
    console.error("[api/pricing-rules GET]", e instanceof Error ? e.message : e);
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth) return unauthorized();
    if (auth.role !== "admin") return forbidden();

    const body = await request.json();
    const name = body.name != null ? String(body.name).trim() : "";
    if (!name) return Response.json({ error: "name required" }, { status: 400 });
    const floor = Number(body.floor_cpm);
    if (!Number.isFinite(floor) || floor < 0.01 || floor > 100) {
      return Response.json({ error: "floor_cpm must be between 0.01 and 100" }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO pricing_rules (name, floor_cpm, applies_to_sizes, applies_to_env, active, rule_type, applies_to_geos, priority)
      VALUES (
        ${name},
        ${floor},
        ${body.applies_to_sizes ?? null},
        ${body.applies_to_env ?? null},
        ${body.active ?? true},
        ${body.rule_type ?? "unified"},
        ${body.applies_to_geos ?? null},
        ${body.priority != null ? Number(body.priority) : 0}
      )
      RETURNING *
    `;
    clearPricingRulesCache();
    const row = result.rows[0];
    if (auth.email) {
      void logAdminActivity({
        adminEmail: auth.email,
        actionType: "pricing_rule_create",
        entityType: "pricing_rule",
        entityId: row?.id != null ? String(row.id) : null,
        newValue: row
      });
    }
    return json(row, 201);
  } catch (e) {
    console.error("[api/pricing-rules POST]", e instanceof Error ? e.message : e);
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
