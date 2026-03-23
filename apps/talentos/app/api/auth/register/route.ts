import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createJwtToken, sessionCookieOptions } from "@/lib/auth";

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

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ detail: "Email already registered" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
      email,
      name,
      passwordHash,
      isSubscribed: false,
      credits: 3,
      },
    });

    const token = await createJwtToken(user.id, email);
    const res = NextResponse.json({
      access_token: token,
      expires_in: 168 * 3600,
      user: { user_id: user.id, email, name, picture: null },
    });
    res.cookies.set("session_token", token, sessionCookieOptions());
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: "Server error" }, { status: 500 });
  }
}
