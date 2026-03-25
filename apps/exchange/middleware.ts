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
  if (pathname.startsWith("/api/campaign-intelligence/") || pathname.startsWith("/api/campaign-ab-results/")) {
    return role === "demand";
  }
  if (pathname.startsWith("/api/audience/")) {
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

  if (pathname === "/api/campaigns/draft" && m === "POST") return true;
  if (/^\/api\/campaigns\/[^/]+\/duplicate$/.test(pathname) && m === "POST") return true;
  if (/^\/api\/campaigns\/[^/]+\/auto-optimize$/.test(pathname) && m === "POST") return true;
  if (/^\/api\/campaigns\/[^/]+\/ab-declare-winner$/.test(pathname) && m === "POST") return true;
  if (/^\/api\/campaigns\/[^/]+\/ab-auto-pause$/.test(pathname) && m === "POST") return true;
  if (pathname === "/api/campaigns/export" && m === "GET" && request.nextUrl.searchParams.get("email")) return true;
  if (/^\/api\/campaign-intelligence\/[^/]+$/.test(pathname) && m === "GET") return true;
  if (/^\/api\/campaign-ab-results\/[^/]+$/.test(pathname) && m === "GET") return true;
  if (pathname === "/api/public/stats" && m === "GET") return true;
  if (pathname === "/api/public/bid-estimate" && m === "GET") return true;
  if (/^\/api\/pixel\/[^/]+$/.test(pathname) && m === "GET") return true;
  if (pathname === "/api/audience/segments" && m === "GET") return true;

  if (pathname === "/api/ads.txt" && m === "GET") return true;

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

  const forwarded = new Headers(request.headers);
  const apiStartMs = pathname.startsWith("/api/") ? Date.now() : null;
  if (apiStartMs != null) {
    forwarded.set("x-exchange-req-start", String(apiStartMs));
  }
  const pass = () =>
    apiStartMs != null
      ? NextResponse.next({ request: { headers: forwarded } })
      : NextResponse.next();
  const apiErr = (body: unknown, status: number) =>
    NextResponse.json(body, {
      status,
      headers:
        apiStartMs != null ? { "X-Response-Time": `${Date.now() - apiStartMs}ms` } : undefined
    });

  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/openrtb") ||
    pathname.startsWith("/api/track") ||
    pathname.startsWith("/api/db-init") ||
    pathname === "/api/ping" ||
    pathname === "/api/health"
  ) {
    return pass();
  }

  if (pathname.startsWith("/api/") && isPublicApi(request, pathname)) {
    return pass();
  }

  if (pathname.startsWith("/api/prebid/")) {
    return pass();
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
      return apiErr({ ok: false, error: "Unauthorized" }, 401);
    }
    const role = token?.role as ExchangeRole | undefined;
    if (!token || !role) {
      return apiErr({ ok: false, error: "Unauthorized" }, 401);
    }
    if (publisherApiAllowed(role, pathname)) {
      return pass();
    }
    if (!apiAllowed(role, pathname, request)) {
      return apiErr({ ok: false, error: "Forbidden" }, 403);
    }
    return pass();
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
    "/api/campaign-intelligence/:path*",
    "/api/campaign-ab-results/:path*",
    "/api/public/:path*",
    "/api/pixel/:path*",
    "/api/audience/:path*",
    "/api/prebid/:path*",
    "/api/openrtb/:path*",
    "/api/track/:path*",
    "/api/db-init",
    "/api/ads.txt",
    "/status",
    "/privacy",
    "/sellers.json"
  ]
};
