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
  if (pathname.startsWith("/api/analytics")) return role === "admin";
  if (pathname.startsWith("/api/admin")) return role === "admin";
  if (pathname.startsWith("/api/auction-stream")) return role === "admin";
  if (pathname.startsWith("/api/publisher-analytics")) return role === "admin" || role === "publisher";
  if (pathname.startsWith("/api/demand-analytics")) return role === "admin" || role === "demand";
  if (pathname.startsWith("/api/pricing/")) return role === "admin";
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

function publisherApiAllowed(role: ExchangeRole | undefined, pathname: string): boolean {
  if (!role) return false;
  if (role === "admin") return true;
  if (role !== "publisher") return false;
  if (
    pathname.startsWith("/api/publisher/") ||
    pathname.startsWith("/api/publisher-floor-analysis/") ||
    pathname.startsWith("/api/publisher-earnings/")
  ) {
    return true;
  }
  return false;
}

function isPublicApi(request: NextRequest, pathname: string): boolean {
  const m = request.method;

  if (pathname === "/api/publishers" && m === "POST") return true;
  if (pathname === "/api/inventory" && m === "POST") return true;
  if (
    pathname === "/api/inventory" &&
    m === "GET" &&
    (request.nextUrl.searchParams.get("publisher_id") || request.nextUrl.searchParams.get("publisherId"))
  ) {
    return true;
  }
  if (/^\/api\/publisher-stats\/[^/]+$/.test(pathname) && m === "GET") {
    return true;
  }
  if (/^\/api\/inventory\/[^/]+$/.test(pathname) && (m === "PATCH" || m === "DELETE")) {
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
  if (
    pathname === "/api/creatives" &&
    m === "GET" &&
    request.nextUrl.searchParams.get("email") &&
    !request.nextUrl.searchParams.get("campaign_id") &&
    !request.nextUrl.searchParams.get("campaignId")
  ) {
    return true;
  }
  if (/^\/api\/campaigns\/[^/]+$/.test(pathname) && m === "PATCH") return true;
  if (/^\/api\/creatives\/[^/]+$/.test(pathname) && (m === "PATCH" || m === "DELETE")) return true;

  return false;
}

function isPublicPage(pathname: string): boolean {
  return (
    pathname === "/publisher" ||
    pathname === "/publisher/register" ||
    pathname === "/publisher/login" ||
    pathname === "/publisher/dashboard" ||
    pathname === "/demand" ||
    pathname === "/demand/create" ||
    pathname === "/demand/dashboard" ||
    pathname === "/publisher/tags" ||
    pathname === "/status" ||
    pathname === "/privacy" ||
    pathname === "/publisher/estimate"
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/openrtb") ||
    pathname.startsWith("/api/track") ||
    pathname.startsWith("/api/db-init") ||
    pathname === "/api/ping" ||
    pathname === "/api/health"
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
    if (publisherApiAllowed(role, pathname)) {
      return NextResponse.next();
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
    "/api/publisher-stats",
    "/api/publisher-stats/:path*",
    "/api/auction-log",
    "/api/auction-log/:path*",
    "/api/auction-stream",
    "/api/analytics",
    "/api/publisher-analytics/:path*",
    "/api/demand-analytics",
    "/api/pricing/:path*",
    "/api/ping",
    "/api/health",
    "/api/admin/:path*",
    "/api/publisher/:path*",
    "/api/publisher-floor-analysis/:path*",
    "/api/publisher-earnings/:path*",
    "/status",
    "/privacy",
    "/sellers.json"
  ]
};
