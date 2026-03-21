import { NextResponse } from "next/server";
import { validateAdmin, createSession, getCookieName } from "../../../../lib/auth.js";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = body.email?.trim() || "";
    const password = body.password || "";
    const user = await validateAdmin(email, password);
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    const token = await createSession(user);
    const res = NextResponse.json({ success: true, user: { email: user.email } });
    res.cookies.set(getCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  } catch (e) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
