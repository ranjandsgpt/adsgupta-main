export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { badRequest, json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role !== "admin") return forbidden();

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return badRequest("Invalid JSON");
  }

  const nextStatus = body.status != null ? String(body.status) : null;
  const nextRole = body.role != null ? String(body.role) : null;
  const nextName = body.name != null ? String(body.name).trim() : null;
  const nextCampaignEmail = body.campaignEmail != null ? String(body.campaignEmail).trim().toLowerCase() : null;
  const publisherIds = Array.isArray(body.publisherIds) ? (body.publisherIds as unknown[]).map(String).filter(Boolean) : null;

  if (nextStatus && !["active", "pending", "suspended"].includes(nextStatus)) return badRequest("Invalid status");
  if (nextRole && !["admin", "publisher", "advertiser"].includes(nextRole)) return badRequest("Invalid role");

  try {
    const result = await sql`
      UPDATE platform_users SET
        name = COALESCE(${nextName}, name),
        role = COALESCE(${nextRole}, role),
        status = COALESCE(${nextStatus}, status),
        campaign_email = COALESCE(${nextCampaignEmail}, campaign_email),
        publisher_ids = COALESCE(${publisherIds}::uuid[], publisher_ids),
        deleted_at = CASE WHEN ${nextStatus} = 'suspended' THEN deleted_at ELSE deleted_at END
      WHERE id = ${params.id}::uuid
      RETURNING id::text, email, name, role, status, publisher_ids::text[] AS publisher_ids, campaign_email, invited_by,
        last_login_at::text, created_at::text, deleted_at::text
    `;
    return json(result.rows[0] ?? null);
  } catch (e) {
    console.error("[platform-users PATCH]", e);
    return json({ error: "Update failed" }, 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role !== "admin") return forbidden();

  try {
    await sql`
      UPDATE platform_users SET deleted_at = now(), status = 'suspended'
      WHERE id = ${params.id}::uuid
    `;
    return json({ ok: true });
  } catch (e) {
    console.error("[platform-users DELETE]", e);
    return json({ error: "Delete failed" }, 500);
  }
}

