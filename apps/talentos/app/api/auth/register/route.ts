import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getDb } from "@/lib/mongodb";
import { createJwtToken, sessionCookieOptions } from "@/lib/auth";
import { generateId } from "@/lib/ids";

export const runtime = "nodejs";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ detail: "Invalid body" }, { status: 400 });
    }
    const { email, password, name } = parsed.data;
    const db = await getDb();

    const existing = await db.collection("users").findOne({ email }, { projection: { _id: 0 } });
    if (existing) {
      return NextResponse.json({ detail: "Email already registered" }, { status: 400 });
    }

    const userId = generateId("user");
    const passwordHash = await bcrypt.hash(password, 12);
    const now = new Date().toISOString();

    await db.collection("users").insertOne({
      user_id: userId,
      email,
      name,
      picture: null,
      auth_provider: "jwt",
      password_hash: passwordHash,
      is_pro: false,
      credits: 3,
      created_at: now,
      updated_at: now,
    });

    const token = await createJwtToken(userId, email);
    const res = NextResponse.json({
      access_token: token,
      expires_in: 168 * 3600,
      user: { user_id: userId, email, name, picture: null },
    });
    res.cookies.set("session_token", token, sessionCookieOptions());
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: "Server error" }, { status: 500 });
  }
}
