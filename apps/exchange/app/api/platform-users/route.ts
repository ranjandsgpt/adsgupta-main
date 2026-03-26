export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role !== "admin") return forbidden();

  try {
    const rows = await sql<{
      id: string;
      email: string;
      name: string;
      role: string;
      status: string;
      publisher_ids: string[] | null;
      campaign_email: string | null;
      invited_by: string | null;
      last_login_at: string | null;
      created_at: string;
      deleted_at: string | null;
    }>`
      SELECT
        id::text,
        email,
        name,
        role,
        status,
        publisher_ids::text[] AS publisher_ids,
        campaign_email,
        invited_by,
        last_login_at::text,
        created_at::text,
        deleted_at::text
      FROM platform_users
      ORDER BY created_at DESC
      LIMIT 500
    `;

    const stats = await sql<{ total: string; active: string; publishers: string; advertisers: string; pending: string }>`
      SELECT
        COUNT(*)::text AS total,
        COUNT(*) FILTER (WHERE status = 'active' AND deleted_at IS NULL)::text AS active,
        COUNT(*) FILTER (WHERE role = 'publisher' AND deleted_at IS NULL)::text AS publishers,
        COUNT(*) FILTER (WHERE role = 'advertiser' AND deleted_at IS NULL)::text AS advertisers,
        COUNT(*) FILTER (WHERE status = 'pending' AND deleted_at IS NULL)::text AS pending
      FROM platform_users
    `;

    return json({
      users: rows.rows,
      stats: {
        total: Number(stats.rows[0]?.total ?? 0),
        active: Number(stats.rows[0]?.active ?? 0),
        publishers: Number(stats.rows[0]?.publishers ?? 0),
        advertisers: Number(stats.rows[0]?.advertisers ?? 0),
        pending: Number(stats.rows[0]?.pending ?? 0)
      }
    });
  } catch (e) {
    console.error("[platform-users GET]", e);
    return json({ users: [], stats: { total: 0, active: 0, publishers: 0, advertisers: 0, pending: 0 } }, 200);
  }
}

