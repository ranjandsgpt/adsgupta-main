export const dynamic = "force-dynamic";
import { sendPublisherActivationEmail } from "@/lib/email";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import { logAdminActivity } from "@/lib/admin-events";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await getAuthFromRequest(request);

    const result = await sql`SELECT * FROM publishers WHERE id = ${params.id} LIMIT 1`;
    const row = result.rows[0] ?? null;

    if (!auth) {
      return json(row);
    }

    if (auth.role === "publisher" && auth.publisherId !== params.id) return forbidden();
    return json(row);
  } catch (e) {
    console.error("[api/publishers/[id] GET]", e instanceof Error ? e.message : e);
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth) return unauthorized();
    if (auth.role !== "admin" && !(auth.role === "publisher" && auth.publisherId === params.id)) {
      return forbidden();
    }

    const body = await request.json();
    const result = await sql`
      UPDATE publishers SET
        name = COALESCE(${body.name ?? null}, name),
        domain = COALESCE(${body.domain ?? null}, domain),
        contact_email = COALESCE(${body.contact_email ?? null}, contact_email),
        ads_txt_verified = COALESCE(${body.ads_txt_verified ?? null}, ads_txt_verified),
        status = COALESCE(${body.status ?? null}, status)
      WHERE id = ${params.id}
      RETURNING *
    `;
    return json(result.rows[0] ?? null);
  } catch (e) {
    console.error("[api/publishers/[id] PUT]", e instanceof Error ? e.message : e);
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth) return unauthorized();
    if (auth.role !== "admin") return forbidden("Only admins can update publisher status");

    const before = await sql<{ status: string }>`SELECT status FROM publishers WHERE id = ${params.id} LIMIT 1`;
    const prevStatus = before.rows[0]?.status;

    const body = await request.json();
    const result = await sql`
      UPDATE publishers SET
        name = COALESCE(${body.name ?? null}, name),
        domain = COALESCE(${body.domain ?? null}, domain),
        contact_email = COALESCE(${body.contact_email ?? null}, contact_email),
        ads_txt_verified = COALESCE(${body.ads_txt_verified ?? null}, ads_txt_verified),
        status = COALESCE(${body.status ?? null}, status)
      WHERE id = ${params.id}
      RETURNING *
    `;
    const row = result.rows[0] as { status: string; contact_email: string | null; name: string; id: string } | undefined;
    if (row && prevStatus !== "active" && row.status === "active") {
      const em = row.contact_email ?? "";
      if (em) void sendPublisherActivationEmail(em, row.name, row.id);
    }
    if (row && auth.email) {
      void logAdminActivity({
        adminEmail: auth.email,
        actionType: "publisher_status_update",
        entityType: "publisher",
        entityId: params.id,
        oldValue: prevStatus,
        newValue: row.status
      });
    }
    return json(row ?? null);
  } catch (e) {
    console.error("[api/publishers/[id] PATCH]", e instanceof Error ? e.message : e);
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth) return unauthorized();
    if (auth.role !== "admin") return forbidden("Only admins can delete publishers");

    await sql`DELETE FROM publishers WHERE id = ${params.id}`;
    if (auth.email) {
      void logAdminActivity({
        adminEmail: auth.email,
        actionType: "publisher_delete",
        entityType: "publisher",
        entityId: params.id
      });
    }
    return json({ ok: true });
  } catch (e) {
    console.error("[api/publishers/[id] DELETE]", e instanceof Error ? e.message : e);
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
