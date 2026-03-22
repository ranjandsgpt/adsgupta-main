import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options.js";

/**
 * @returns {Promise<{ id: string, email: string, name?: string, subdomain?: string } | null>}
 */
export async function getUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  return {
    id: session.user.email,
    email: session.user.email,
    name: session.user.name,
    subdomain: session.user.subdomain,
  };
}

/** Same as getUser — use in API routes that require a logged-in admin. */
export async function requireAuth() {
  return getUser();
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/** Synthetic profile for admin UI (no profiles table). */
export function profileFromUser(user) {
  if (!user?.email) return null;
  return {
    full_name: user.name || user.email,
    username: String(user.email).split("@")[0],
    subdomain: user.subdomain || null,
  };
}
