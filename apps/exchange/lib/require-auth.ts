import type { ExchangeRole } from "@/lib/roles";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { getSessionTokenCookieName } from "@adsgupta/auth/lib/session-cookie";

export type AuthContext = {
  role: ExchangeRole;
  publisherId: string | null;
  publisherIds?: string[] | null;
  demandAdvertiser: string | null;
  campaignEmail?: string | null;
  adminAccess?: "admin" | "ops" | "viewer" | null;
  email?: string | null;
};

export async function getAuthFromRequest(request: NextRequest): Promise<AuthContext | null> {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return null;
  const token = await getToken({
    req: request as never,
    secret,
    cookieName: getSessionTokenCookieName(process.env.NEXTAUTH_URL),
  });
  if (!token) return null;

  let role = token.role as ExchangeRole | undefined;
  if (!role && token.exchangeRole) {
    role = token.exchangeRole as ExchangeRole;
  }
  if (!role && Array.isArray(token.appRoles)) {
    const ex = (
      token.appRoles as Array<{ appSlug?: string; role?: string; status?: string }>
    ).find((r) => r.appSlug === "exchange" && r.status === "active");
    if (ex?.role) role = ex.role as ExchangeRole;
  }
  if (!role) return null;

  return {
    role,
    publisherId: (token.publisherId as string | null | undefined) ?? null,
    publisherIds: (token.publisherIds as string[] | null | undefined) ?? null,
    demandAdvertiser: (token.demandAdvertiser as string | null | undefined) ?? null,
    campaignEmail: (token.campaignEmail as string | null | undefined) ?? null,
    adminAccess: (token.adminAccess as "admin" | "ops" | "viewer" | null | undefined) ?? null,
    email: token.email ? String(token.email) : null,
  };
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ ok: false, error: message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ ok: false, error: message }, { status: 403 });
}
