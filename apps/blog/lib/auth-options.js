import { createAuthOptions } from "@adsgupta/auth";

/**
 * Blog admin auth — shared AdsGupta SSO cookie via @adsgupta/auth.
 * Blog admin gate uses user_app_roles (app_slug=blog) with ADMIN_USER_* env fallback.
 */
export const authOptions = createAuthOptions({
  appUrl: process.env.NEXTAUTH_URL || "https://blog.adsgupta.com",
  cookieDomain: process.env.AUTH_COOKIE_DOMAIN || ".adsgupta.com",
});
