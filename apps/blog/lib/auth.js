import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options.js";

/**
 * @returns {Promise<{ id: string, email: string, name?: string, subdomain?: string } | null>}
 */
export async function getUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const email = session.user.email;
  let subdomain = session.user.subdomain;

  // Env fallback for subdomain when JWT has no meta yet
  if (!subdomain) {
    for (let i = 1; i <= 5; i++) {
      const adminEmail = process.env[`ADMIN_USER_${i}_EMAIL`]?.trim().toLowerCase();
      if (adminEmail && adminEmail === email.trim().toLowerCase()) {
        subdomain = process.env[`ADMIN_USER_${i}_SUBDOMAIN`]?.trim() || "ranjan";
        break;
      }
    }
  }

  // Role gate: session appRoles or env admin
  const roles = Array.isArray(session.user.appRoles) ? session.user.appRoles : [];
  const isBlogAdmin = roles.some(
    (r) =>
      r &&
      r.appSlug === "blog" &&
      r.status === "active" &&
      (r.role === "admin" || r.role === "author")
  );
  let isEnvAdmin = false;
  for (let i = 1; i <= 5; i++) {
    const adminEmail = process.env[`ADMIN_USER_${i}_EMAIL`]?.trim().toLowerCase();
    if (adminEmail && adminEmail === email.trim().toLowerCase()) {
      isEnvAdmin = true;
      break;
    }
  }
  if (!isBlogAdmin && !isEnvAdmin) return null;

  return {
    id: session.user.id || email,
    email,
    name: session.user.name,
    subdomain: subdomain || "ranjan",
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
