export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { badRequest, json } from "@/lib/http";
import { forbidden, getAuthFromRequest, unauthorized } from "@/lib/require-auth";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

type Body = {
  name?: string;
  email?: string;
  role?: string;
  campaignEmail?: string;
  publisherIds?: string[];
  password?: string;
};

function normEmail(x: string): string {
  return x.trim().toLowerCase();
}

export async function POST(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorized();
  if (auth.role !== "admin") return forbidden();

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return badRequest("Invalid JSON");
  }

  const name = String(body.name ?? "").trim();
  const email = body.email ? normEmail(String(body.email)) : "";
  const role = body.role === "advertiser" ? "advertiser" : body.role === "publisher" ? "publisher" : null;
  if (!name) return badRequest("name is required");
  if (!email || !email.includes("@")) return badRequest("valid email is required");
  if (!role) return badRequest("role must be publisher or advertiser");
  if (role === "advertiser" && body.campaignEmail && normEmail(body.campaignEmail) !== email) {
    // Keep it simple: campaignEmail defaults to user email.
    return badRequest("campaignEmail must match email (or omit it)");
  }

  const publisherIds = Array.isArray(body.publisherIds) ? body.publisherIds.filter(Boolean) : [];
  const campaignEmail = role === "advertiser" ? email : null;

  const password = body.password ? String(body.password) : null;
  const passwordHash = password ? await bcrypt.hash(password, 10) : null;

  try {
    await sql`
      INSERT INTO platform_users (email, name, role, status, publisher_ids, campaign_email, invited_by, password_hash)
      VALUES (
        ${email},
        ${name},
        ${role},
        'pending',
        ${publisherIds.length ? publisherIds : null}::uuid[],
        ${campaignEmail},
        ${auth.email ?? "admin"},
        ${passwordHash}
      )
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        publisher_ids = COALESCE(EXCLUDED.publisher_ids, platform_users.publisher_ids),
        campaign_email = COALESCE(EXCLUDED.campaign_email, platform_users.campaign_email),
        invited_by = EXCLUDED.invited_by
    `;

    const row = await sql<{ id: string; status: string }>`
      SELECT id::text AS id, status FROM platform_users WHERE email = ${email} LIMIT 1
    `;
    return json({ ok: true, id: row.rows[0]?.id, status: row.rows[0]?.status ?? "pending" }, 201);
  } catch (e) {
    console.error("[platform-users invite]", e);
    return json({ error: "Invite failed" }, 500);
  }
}

