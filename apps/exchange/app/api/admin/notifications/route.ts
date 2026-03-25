import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request as NextRequest);
  if (!auth) return unauthorized();
  if (auth.role !== "admin") return forbidden();

  try {
    const result = await sql<{
      id: string;
      type: string;
      message: string;
      entity_type: string | null;
      entity_id: string | null;
      read: boolean;
      created_at: string;
    }>`
      SELECT id, type, message, entity_type, entity_id, read, created_at
      FROM admin_notifications
      WHERE read = false
      ORDER BY created_at DESC
      LIMIT 20
    `;

    return json(
      result.rows.map((r) => ({
        id: r.id,
        type: r.type as
          | "new_publisher"
          | "new_campaign"
          | "performance_drop"
          | "budget_exhausted"
          | "system_alert",
        message: r.message,
        entityId: r.entity_id ?? undefined,
        entityType: r.entity_type ?? undefined,
        read: r.read,
        createdAt: r.created_at
      }))
    );
  } catch (e) {
    console.error("[admin/notifications] ", e);
    return json([], { status: 200 });
  }
}

