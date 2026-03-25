export const dynamic = "force-dynamic";
import { logAdminActivity } from "@/lib/admin-events";
import { clearPricingRulesCache } from "@/lib/floor-engine";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth) return unauthorized();
    if (auth.role !== "admin") return forbidden();

    const result = await sql`SELECT * FROM pricing_rules WHERE id = ${params.id} LIMIT 1`;
    return json(result.rows[0] ?? null);
  } catch (e) {
    console.error("[api/pricing-rules/[id] GET]", e instanceof Error ? e.message : e);
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, ctx: { params: { id: string } }) {
  return PATCH(request, ctx);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth) return unauthorized();
    if (auth.role !== "admin") return forbidden();

    const body = await request.json();
    const before = await sql`SELECT * FROM pricing_rules WHERE id = ${params.id} LIMIT 1`;

    const result = await sql`
      UPDATE pricing_rules SET
        name = COALESCE(${body.name ?? null}, name),
        floor_cpm = COALESCE(${body.floor_cpm ?? null}, floor_cpm),
        applies_to_sizes = COALESCE(${body.applies_to_sizes ?? null}, applies_to_sizes),
        applies_to_env = COALESCE(${body.applies_to_env ?? null}, applies_to_env),
        active = COALESCE(${body.active ?? null}, active),
        rule_type = COALESCE(${body.rule_type ?? null}, rule_type),
        applies_to_geos = COALESCE(${body.applies_to_geos ?? null}, applies_to_geos),
        priority = COALESCE(${body.priority !== undefined ? Number(body.priority) : null}, priority)
      WHERE id = ${params.id}
      RETURNING *
    `;
    clearPricingRulesCache();
    const row = result.rows[0] ?? null;
    if (row && auth.email) {
      void logAdminActivity({
        adminEmail: auth.email,
        actionType: "pricing_rule_update",
        entityType: "pricing_rule",
        entityId: params.id,
        oldValue: before.rows[0],
        newValue: row
      });
    }
    return json(row);
  } catch (e) {
    console.error("[api/pricing-rules/[id] PATCH]", e instanceof Error ? e.message : e);
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth) return unauthorized();
    if (auth.role !== "admin") return forbidden();

    await sql`UPDATE pricing_rules SET active = false WHERE id = ${params.id}`;
    clearPricingRulesCache();
    if (auth.email) {
      void logAdminActivity({
        adminEmail: auth.email,
        actionType: "pricing_rule_deactivate",
        entityType: "pricing_rule",
        entityId: params.id
      });
    }
    return json({ ok: true });
  } catch (e) {
    console.error("[api/pricing-rules/[id] DELETE]", e instanceof Error ? e.message : e);
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
