/**
 * Fixed admin login for AdsGupta BlogAI CMS.
 * Session stored in secure httpOnly cookie (JWT).
 * Credentials: ranjan@adsgupta.com / ranjan@123
 */

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADSGUPTA_JWT_SECRET || "adsgupta-blog-cms-secret-change-in-production"
);
const COOKIE_NAME = "adsgupta_admin_session";
const JWT_EXPIRY = "7d";

const FIXED_ADMIN_EMAIL = "ranjan@adsgupta.com";
const FIXED_ADMIN_PASSWORD = "ranjan@123";

/**
 * Validate admin credentials against DB, or fixed fallback when DB unavailable.
 * @returns {Promise<{ id: number, email: string } | null>}
 */
export async function validateAdmin(email, password) {
  if (!email || !password) return null;
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail === FIXED_ADMIN_EMAIL && password === FIXED_ADMIN_PASSWORD) {
    return { id: 1, email: FIXED_ADMIN_EMAIL };
  }
  try {
    const { getDatabase } = await import("./db.js");
    const db = getDatabase();
    const user = db.prepare("SELECT id, email, password FROM users WHERE email = ?").get(normalizedEmail);
    if (!user || !bcrypt.compareSync(password, user.password)) return null;
    return { id: user.id, email: user.email };
  } catch {
    return null;
  }
}

/**
 * Create a session token for the user (JWT).
 * Caller must set the cookie on the response.
 */
export async function createSession(user) {
  const token = await new SignJWT({ sub: String(user.id), email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(JWT_EXPIRY)
    .setIssuedAt()
    .sign(JWT_SECRET);
  return token;
}

/**
 * Check session from cookie value. Used in middleware and API.
 * @returns {{ id: number, email: string } | null}
 */
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

export function getCookieName() {
  return COOKIE_NAME;
}

/** Hash password for storing in DB (e.g. when creating users). */
export function hashPassword(plain) {
  return bcrypt.hashSync(plain, 10);
}
