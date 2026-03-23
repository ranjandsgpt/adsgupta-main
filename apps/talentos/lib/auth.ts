import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import type { NextRequest } from "next/server";
import { prisma } from "./prisma";

const JWT_ALG = "HS256";
export const JWT_EXPIRATION_HOURS = 168;

function getSecret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(s);
}

export async function createJwtToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ sub: userId, email })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime(`${JWT_EXPIRATION_HOURS}h`)
    .sign(getSecret());
}

export async function verifyJwtToken(token: string): Promise<{ sub: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: [JWT_ALG] });
    const sub = typeof payload.sub === "string" ? payload.sub : null;
    const email = typeof payload.email === "string" ? payload.email : "";
    if (!sub) return null;
    return { sub, email };
  } catch {
    return null;
  }
}

export type AppUser = Record<string, unknown> & {
  user_id: string;
  email: string;
  name?: string;
  picture?: string | null;
};

function stripPassword(u: Record<string, unknown>): AppUser {
  const copy = {
    user_id: String(u.id ?? ""),
    email: String(u.email ?? ""),
    name: (u.name as string | undefined) ?? "",
    picture: null,
  };
  return copy as AppUser;
}

export function getSessionTokenFromRequest(request: NextRequest): string | undefined {
  const c = request.cookies.get("session_token")?.value;
  if (c) return c;
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return undefined;
}

export async function getCurrentUserFromRequest(request: NextRequest): Promise<AppUser> {
  const sessionToken = getSessionTokenFromRequest(request);
  if (!sessionToken) throw new Error("UNAUTHORIZED");
  const payload = await verifyJwtToken(sessionToken);
  if (!payload) throw new Error("UNAUTHORIZED");
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) throw new Error("UNAUTHORIZED");
  return stripPassword(user as unknown as Record<string, unknown>);
}

export async function getSessionTokenFromServerContext(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const h = await headers();
  let t = cookieStore.get("session_token")?.value;
  if (!t) {
    const auth = h.get("authorization");
    if (auth?.startsWith("Bearer ")) t = auth.slice(7);
  }
  return t;
}

export function sessionCookieOptions() {
  const secure = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: JWT_EXPIRATION_HOURS * 3600,
  };
}
