export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
import { json } from "@/lib/http";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

type RegisterBody = {
  role?: string;
  name?: string;
  email?: string;
  password?: string;
};

function normEmail(x: string): string {
  return x.trim().toLowerCase();
}

export async function POST(request: NextRequest) {
  let body: RegisterBody;
  try {
    body = (await request.json()) as RegisterBody;
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const role = body.role === "advertiser" ? "advertiser" : body.role === "publisher" ? "publisher" : null;
  const name = String(body.name ?? "").trim();
  const emailRaw = String(body.email ?? "");
  const email = emailRaw ? normEmail(emailRaw) : "";
  const password = String(body.password ?? "");

  if (!role) return json({ error: "role must be publisher or advertiser" }, 400);
  if (!name) return json({ error: "name is required" }, 400);
  if (!email || !email.includes("@")) return json({ error: "valid email is required" }, 400);
  if (!password || password.length < 8) return json({ error: "password must be at least 8 characters" }, 400);

  try {
    const hash = await bcrypt.hash(password, 10);
    const campaignEmail = role === "advertiser" ? email : null;

    await sql`
      INSERT INTO platform_users (email, name, password_hash, role, status, campaign_email)
      VALUES (${email}, ${name}, ${hash}, ${role}, 'pending', ${campaignEmail})
      ON CONFLICT (email) DO NOTHING
    `;

    const check = await sql<{ id: string; status: string }>`
      SELECT id::text AS id, status FROM platform_users WHERE email = ${email} LIMIT 1
    `;
    const row = check.rows[0];
    if (!row) return json({ error: "Registration failed" }, 500);
    if (row.status !== "pending") {
      // If user already existed and is active/suspended, do not overwrite. Still return OK-ish but inform.
      return json({ ok: true, id: row.id, status: row.status }, 200);
    }

    return json({ ok: true, id: row.id, status: row.status }, 201);
  } catch (e) {
    console.error("[platform-users/register]", e);
    return json({ error: "Registration failed" }, 500);
  }
}

