import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role !== "admin") return forbidden();

  try {
    const result = await sql`
      UPDATE admin_notifications
      SET read = true
      WHERE id = ${params.id}
      RETURNING id
    `;
    return json({ ok: true, id: result.rows[0]?.id ?? params.id });
  } catch (e) {
    console.error("[admin/notifications/mark-read]", e);
    return json({ ok: false }, { status: 500 });
  }
}

