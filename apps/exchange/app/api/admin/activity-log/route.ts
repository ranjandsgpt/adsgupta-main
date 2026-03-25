import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role !== "admin") return forbidden();

  const adminEmail = request.nextUrl.searchParams.get("admin_email");
  const actionType = request.nextUrl.searchParams.get("action_type");
  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");
  const limitRaw = request.nextUrl.searchParams.get("limit");
  const limit = limitRaw ? Math.max(1, Math.min(200, Number(limitRaw) || 50)) : 50;

  try {
    const result = await sql<{
      id: string;
      admin_email: string;
      action_type: string;
      entity_type: string;
      entity_id: string | null;
      old_value: string | null;
      new_value: string | null;
      created_at: string;
    }>`
      SELECT id, admin_email, action_type, entity_type, entity_id, old_value, new_value, created_at
      FROM admin_activity_log
      WHERE (${adminEmail ?? null}::text IS NULL OR admin_email = ${adminEmail ?? null})
        AND (${actionType ?? null}::text IS NULL OR action_type = ${actionType ?? null})
        AND (${from ?? null}::timestamptz IS NULL OR created_at >= ${from ?? null}::timestamptz)
        AND (${to ?? null}::timestamptz IS NULL OR created_at <= ${to ?? null}::timestamptz)
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    return json(result.rows);
  } catch (e) {
    console.error("[admin/activity-log]", e);
    return json([], { status: 200 });
  }
}

