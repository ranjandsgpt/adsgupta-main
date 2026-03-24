import type { ExchangeRole } from "@/lib/roles";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function portalFromPath(pathname: string): "admin" | "publisher" | "demand" {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/publisher")) return "publisher";
  return "demand";
}

function canAccess(role: ExchangeRole | undefined, pathname: string): boolean {
  if (!role) return false;
  if (role === "admin") return true;
  if (pathname.startsWith("/admin")) return false;
  if (pathname.startsWith("/publisher")) return role === "publisher";
  if (pathname.startsWith("/demand")) return role === "demand";
  return false;
}

function apiAllowed(role: ExchangeRole | undefined, pathname: string, request: NextRequest): boolean {
  if (!role) return false;
  if (role === "admin") return true;
  if (pathname.startsWith("/api/pricing-rules")) return false;
  if (pathname.startsWith("/api/auction-log")) return false;
  if (pathname.startsWith("/api/publishers")) return role === "publisher";
  if (pathname.startsWith("/api/inventory")) return role === "publisher";
  if (pathname.startsWith("/api/campaigns") || pathname.startsWith("/api/creatives")) {
    return role === "demand";
  }
  if (pathname.startsWith("/api/reports")) return true;
  return false;
}

function isPublicApi(request: NextRequest, pathname: string): boolean {
  const m = request.method;

  if (pathname === "/api/publishers" && m === "POST") return true;
  if (pathname === "/api/inventory" && m === "POST") return true;
  if (pathname === "/api/inventory" && m === "GET" && request.nextUrl.searchParams.get("publisher_id")) {
    return true;
  }
  if (pathname === "/api/campaigns" && m === "POST") return true;
  if (pathname === "/api/campaigns" && m === "GET" && request.nextUrl.searchParams.get("email")) {
    return true;
  }
  if (pathname === "/api/creatives" && m === "POST") return true;
  if (/^\/api\/publishers\/[^/]+$/.test(pathname) && m === "GET") return true;
  if (/^\/api\/campaigns\/[^/]+$/.test(pathname) && m === "GET") return true;
  if (
    pathname === "/api/creatives" &&
    m === "GET" &&
    request.nextUrl.searchParams.get("campaign_id") &&
    request.nextUrl.searchParams.get("email")
  ) {
    return true;
  }

  return false;
}

function isPublicPage(pathname: string): boolean {
  return (
    pathname === "/publisher" ||
    pathname === "/publisher/register" ||
    pathname === "/publisher/dashboard" ||
    pathname === "/demand" ||
    pathname === "/demand/create" ||
    pathname === "/demand/dashboard"
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/openrtb") ||
    pathname.startsWith("/api/track") ||
    pathname.startsWith("/api/db-init")
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/") && isPublicApi(request, pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    let token;
    try {
      token = await getToken({
        req: request as never,
        secret: process.env.NEXTAUTH_SECRET
      });
    } catch (e) {
      console.error("[exchange] middleware getToken (api) failed:", e);
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    const role = token?.role as ExchangeRole | undefined;
    if (!token || !role) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    if (!apiAllowed(role, pathname, request)) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.next();
  }

  if (pathname === "/" || pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  if (isPublicPage(pathname)) {
    return NextResponse.next();
  }

  let token;
  try {
    token = await getToken({
      req: request as never,
      secret: process.env.NEXTAUTH_SECRET
    });
  } catch (e) {
    console.error("[exchange] middleware getToken failed:", e);
    const portal = portalFromPath(pathname);
    const login = new URL("/login", request.url);
    login.searchParams.set("portal", portal);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }
  const role = token?.role as ExchangeRole | undefined;

  if (!token || !role || !canAccess(role, pathname)) {
    const portal = portalFromPath(pathname);
    const login = new URL("/login", request.url);
    login.searchParams.set("portal", portal);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/publisher/:path*",
    "/demand/:path*",
    "/api/publishers",
    "/api/publishers/:path*",
    "/api/inventory",
    "/api/inventory/:path*",
    "/api/campaigns",
    "/api/campaigns/:path*",
    "/api/creatives",
    "/api/creatives/:path*",
    "/api/pricing-rules",
    "/api/pricing-rules/:path*",
    "/api/reports",
    "/api/reports/:path*",
    "/api/auction-log",
    "/api/auction-log/:path*"
  ]
};
