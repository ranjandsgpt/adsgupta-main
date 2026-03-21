import { NextResponse } from "next/server";
import { checkSession, getCookieName } from "../../../../lib/auth.js";

export async function GET(request) {
  const cookie = request.cookies.get(getCookieName())?.value;
  const user = await checkSession(cookie);
  if (!user) return NextResponse.json({ user: null }, { status: 200 });
  return NextResponse.json({ user: { id: user.id, email: user.email } });
}
