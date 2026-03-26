import type { ExchangeRole } from "@/lib/roles";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

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
  // next-auth/jwt types can disagree with nested Next.js Request in monorepos
  const token = await getToken({ req: request as never, secret });
  if (!token?.role) return null;
  return {
    role: token.role as ExchangeRole,
    publisherId: (token.publisherId as string | null | undefined) ?? null,
    publisherIds: (token.publisherIds as string[] | null | undefined) ?? null,
    demandAdvertiser: (token.demandAdvertiser as string | null | undefined) ?? null,
    campaignEmail: (token.campaignEmail as string | null | undefined) ?? null,
    adminAccess: (token.adminAccess as "admin" | "ops" | "viewer" | null | undefined) ?? null,
    email: token.email ? String(token.email) : null
  };
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ ok: false, error: message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ ok: false, error: message }, { status: 403 });
}
