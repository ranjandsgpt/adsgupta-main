import { NextResponse } from "next/server";
import { checkSession, getCookieName } from "./lib/auth-edge.js";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login") return NextResponse.next();

  const cookie = request.cookies.get(getCookieName())?.value;
  const user = await checkSession(cookie);
  if (!user) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
