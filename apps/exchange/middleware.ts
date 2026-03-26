import type { ExchangeRole } from "@/lib/roles";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
  if (pathname === "/api/campaigns/bulk" && m === "POST") return true;
  if (pathname === "/api/campaigns/bulk-status" && m === "PATCH") return true;
  if (/^\/api\/campaign-intelligence\/[^/]+$/.test(pathname) && m === "GET") return true;
  if (/^\/api\/campaign-ab-results\/[^/]+$/.test(pathname) && m === "GET") return true;
  if (pathname.startsWith("/api/openrtb/")) return true;
  if (pathname.startsWith("/api/track/")) return true;
  if (pathname === "/api/public/stats" && m === "GET") return true;
  if (pathname === "/api/signals" && (m === "POST" || m === "OPTIONS")) return true;
  if (pathname === "/api/cron/daily-reset" && m === "GET") return true;
  if (pathname === "/api/public/bid-estimate" && m === "GET") return true;
  if (pathname === "/api/test/e2e" && m === "GET") return true;
  if (/^\/api\/pixel\/[^/]+$/.test(pathname) && m === "GET") return true;
  if (pathname === "/api/audience/segments" && m === "GET") return true;

  if (pathname === "/api/ads.txt" && m === "GET") return true;

  return false;
}

function isPublicRoute(request: NextRequest, pathname: string): boolean {
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/publisher/register" ||
    pathname === "/privacy" ||
    pathname === "/status" ||
    pathname === "/sellers.json" ||
    pathname === "/ads.txt" ||
    pathname === "/mde.js" ||
    pathname === "/test-ad.html"
  ) {
    return true;
  }
  if (pathname.startsWith("/docs")) return true;
  if (pathname.startsWith("/api/") && isPublicApi(request, pathname)) return true;
  return false;
}

function roleHome(role: ExchangeRole | undefined, token: Record<string, unknown>): string {
  if (role === "admin") return "/platform";
  if (role === "publisher") {
    const ids = (token.publisherIds as string[] | null | undefined) ?? [];
    const id = ids[0] ?? (token.publisherId as string | null | undefined) ?? "";
    return id ? `/publisher/dashboard?id=${encodeURIComponent(id)}` : "/publisher/dashboard";
  }
  if (role === "advertiser" || role === "demand") {
    const email = (token.campaignEmail as string | null | undefined) ?? (token.email as string | null | undefined);
    return email ? `/demand/dashboard?email=${encodeURIComponent(email)}` : "/demand/dashboard";
  }
  return "/login";
}

function isProtectedRoute(pathname: string): boolean {
  if (pathname.startsWith("/api/")) return true;
  if (pathname.startsWith("/platform")) return true;
  if (pathname.startsWith("/publisher")) return true;
  if (pathname.startsWith("/demand")) return true;
  if (pathname.startsWith("/admin")) return true;
  return (
    pathname.startsWith("/stats") ||
    pathname.startsWith("/prebid")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/_next") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  if (isPublicRoute(request, pathname) || pathname.startsWith("/api/auth")) {
    const token = await getToken({ req: request as never, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.next();
    const role = token.role as ExchangeRole | undefined;
    if ((pathname === "/" || pathname === "/login") && role) {
      return NextResponse.redirect(new URL(roleHome(role, token as Record<string, unknown>), request.url));
    }
    return NextResponse.next();
  }

  if (!isProtectedRoute(pathname)) return NextResponse.next();

  const token = await getToken({ req: request as never, secret: process.env.NEXTAUTH_SECRET });
  const role = token?.role as ExchangeRole | undefined;
  if (!token || !role) {
    const login = new URL("/login", request.url);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  if (pathname.startsWith("/platform") && role !== "admin") {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (pathname.startsWith("/publisher") && role === "advertiser") {
    return NextResponse.redirect(new URL(roleHome(role, token as Record<string, unknown>), request.url));
  }
  if (pathname.startsWith("/demand") && role === "publisher") {
    return NextResponse.redirect(new URL(roleHome(role, token as Record<string, unknown>), request.url));
  }
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
