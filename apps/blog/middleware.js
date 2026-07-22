import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getSessionTokenCookieName } from "@adsgupta/auth/lib/session-cookie";

function isEnvBlogAdmin(email) {
  if (!email) return false;
  const normalized = String(email).trim().toLowerCase();
  for (let i = 1; i <= 5; i++) {
    const adminEmail = process.env[`ADMIN_USER_${i}_EMAIL`]?.trim().toLowerCase();
    if (adminEmail && adminEmail === normalized) return true;
  }
  return false;
}

function hasBlogAdminRole(token) {
  if (!token) return false;
  if (isEnvBlogAdmin(token.email)) return true;
  const roles = Array.isArray(token.appRoles) ? token.appRoles : [];
  return roles.some(
    (r) =>
      r &&
      r.appSlug === "blog" &&
      r.status === "active" &&
      (r.role === "admin" || r.role === "author")
  );
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: getSessionTokenCookieName(process.env.NEXTAUTH_URL),
    });
    if (!token || !hasBlogAdminRole(token)) {
      const login = new URL("/admin/login", request.url);
      login.searchParams.set("from", pathname);
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
