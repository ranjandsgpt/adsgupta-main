import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createJwtToken, sessionCookieOptions } from "@/lib/auth";

export const runtime = "nodejs";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ detail: "Invalid body" }, { status: 400 });
    }
    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ detail: "Invalid email or password" }, { status: 401 });
    }
    if (!user.passwordHash || typeof user.passwordHash !== "string") {
      return NextResponse.json({ detail: "Invalid email or password" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ detail: "Invalid email or password" }, { status: 401 });
    }

    const token = await createJwtToken(user.id, user.email);
    const res = NextResponse.json({
      access_token: token,
      expires_in: 168 * 3600,
      user: {
        user_id: user.id,
        email: user.email,
        name: user.name,
        picture: null,
      },
    });
    res.cookies.set("session_token", token, sessionCookieOptions());
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: "Server error" }, { status: 500 });
  }
}
