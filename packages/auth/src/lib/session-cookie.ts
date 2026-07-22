/** Shared NextAuth session cookie for cross-subdomain SSO. */

export function useSecureAuthCookies(appUrl?: string): boolean {
  return Boolean(
    (appUrl || process.env.NEXTAUTH_URL || '').startsWith('https://') ||
      process.env.NODE_ENV === 'production'
  );
}

export function getAuthCookieDomain(override?: string): string | undefined {
  return (
    override ||
    process.env.AUTH_COOKIE_DOMAIN ||
    (process.env.NODE_ENV === 'production' ? '.adsgupta.com' : undefined)
  );
}

export function getSessionTokenCookieName(appUrl?: string): string {
  const prefix = useSecureAuthCookies(appUrl) ? '__Secure-' : '';
  return `${prefix}adsgupta.session-token`;
}
