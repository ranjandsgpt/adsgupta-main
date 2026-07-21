export function getAppSlug(): string {
  return (
    process.env.APP_SLUG ||
    process.env.NEXT_PUBLIC_APP_SLUG ||
    'audit-tool'
  );
}

export function getAuthCookieDomain(): string {
  return process.env.AUTH_COOKIE_DOMAIN || '.adsgupta.com';
}

export function getPassAmountPaise(): number {
  const raw = process.env.PASS_AMOUNT_PAISE;
  if (raw) {
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isNaN(parsed) && parsed > 0) return parsed;
  }
  return 50000;
}

export function getPassDurationHours(): number {
  const raw = process.env.PASS_DURATION_HOURS;
  if (raw) {
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isNaN(parsed) && parsed > 0) return parsed;
  }
  return 72;
}

export function isFreebieEnabled(): boolean {
  const publicFlag = process.env.NEXT_PUBLIC_FREEBIE_ENABLED;
  const serverFlag = process.env.FREEBIE_ENABLED;
  return publicFlag === 'true' || serverFlag === 'true';
}

export function isBillingQrEnabled(): boolean {
  const publicFlag = process.env.NEXT_PUBLIC_BILLING_QR_ENABLED;
  const serverFlag = process.env.BILLING_QR_ENABLED;
  return publicFlag === 'true' || serverFlag === 'true';
}

/** True when Supabase public env is present (hosts can fall back to legacy auth). */
export function isIdentityConfigured(): boolean {
  if (process.env.NEXT_PUBLIC_IDENTITY_ENABLED === 'false') return false;
  if (process.env.NEXT_PUBLIC_IDENTITY_ENABLED === 'true') return true;
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  return Boolean(url && anon);
}

export function getSupabaseUrl(): string {
  const url =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error(
      'Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL for @adsgupta/identity'
    );
  }
  return url;
}

export function getSupabaseAnonKey(): string {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY for @adsgupta/identity'
    );
  }
  return key;
}

export function getSupabaseServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY for @adsgupta/identity server operations'
    );
  }
  return key;
}

export function getRazorpayKeyId(): string {
  const key = process.env.RAZORPAY_KEY_ID;
  if (!key) {
    throw new Error('Missing RAZORPAY_KEY_ID');
  }
  return key;
}

export function getRazorpayKeySecret(): string {
  const key = process.env.RAZORPAY_KEY_SECRET;
  if (!key) {
    throw new Error('Missing RAZORPAY_KEY_SECRET');
  }
  return key;
}

export function getRazorpayWebhookSecret(): string | null {
  return process.env.RAZORPAY_WEBHOOK_SECRET || null;
}

export function getFreebieDailyLimit(): number | null {
  const raw = process.env.FREEBIE_DAILY_LIMIT;
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) || parsed < 0 ? null : parsed;
}
