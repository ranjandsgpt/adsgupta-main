/**
 * Edge-safe auth helpers (JWT only). Used by middleware.
 * Do not import db or bcrypt here.
 */

import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADSGUPTA_JWT_SECRET || "adsgupta-blog-cms-secret-change-in-production"
);
const COOKIE_NAME = "adsgupta_admin_session";

export function getCookieName() {
  return COOKIE_NAME;
}

export async function checkSession(cookieValue) {
  if (!cookieValue) return null;
  try {
    const { payload } = await jwtVerify(cookieValue, JWT_SECRET);
    const sub = payload.sub;
    const email = payload.email;
    if (!sub || !email) return null;
    return { id: parseInt(sub, 10), email };
  } catch {
    return null;
  }
}
