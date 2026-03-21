import { NextResponse } from "next/server";
import { getCookieName } from "../../../../lib/auth.js";

export function POST(request) {
  const url = request.nextUrl || new URL(request.url);
  const origin = url.origin || "http://localhost:3000";
  const res = NextResponse.redirect(new URL("/admin/login", origin));
  res.cookies.set(getCookieName(), "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
