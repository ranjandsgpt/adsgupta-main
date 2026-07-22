/** Central AdsGupta login + user management (all network sign-in flows). */
export const PLATFORM_AUTH_PATH = '/platform/usermanagement';

export function getPlatformAuthOrigin(): string {
  if (typeof window !== 'undefined') {
    const fromEnv = process.env.NEXT_PUBLIC_PLATFORM_AUTH_URL;
    if (fromEnv) return fromEnv.replace(/\/platform\/usermanagement\/?$/, '').replace(/\/$/, '');
    if (window.location.hostname === 'localhost') {
      return `http://localhost:${process.env.NEXT_PUBLIC_PLATFORM_AUTH_PORT || '3010'}`;
    }
  }
  const env =
    process.env.NEXT_PUBLIC_PLATFORM_AUTH_URL ||
    process.env.PLATFORM_AUTH_URL ||
    'https://adsgupta.com';
  return env.replace(/\/platform\/usermanagement\/?$/, '').replace(/\/$/, '');
}

export function buildPlatformAuthUrl(options?: {
  returnTo?: string;
  mode?: 'signin' | 'register' | 'trial' | 'free';
}): string {
  const base = `${getPlatformAuthOrigin()}${PLATFORM_AUTH_PATH}`;
  const url = new URL(base);
  if (options?.returnTo) {
    url.searchParams.set('returnTo', options.returnTo);
  }
  if (options?.mode && options.mode !== 'signin') {
    url.searchParams.set('mode', options.mode);
  }
  return url.toString();
}

/** Safe redirect target — only *.adsgupta.com or localhost. */
export function sanitizeReturnTo(raw: string | null | undefined, fallback = '/'): string {
  if (!raw) return fallback;
  try {
    const u = new URL(raw);
    const host = u.hostname.toLowerCase();
    if (
      host === 'localhost' ||
      host.endsWith('.adsgupta.com') ||
      host === 'adsgupta.com'
    ) {
      return u.toString();
    }
  } catch {
    if (raw.startsWith('/') && !raw.startsWith('//')) return raw;
  }
  return fallback;
}

export function isPlatformAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  for (let i = 1; i <= 5; i++) {
    const adminEmail = process.env[`ADMIN_USER_${i}_EMAIL`]?.trim().toLowerCase();
    if (adminEmail && adminEmail === normalized) return true;
  }
  return false;
}
