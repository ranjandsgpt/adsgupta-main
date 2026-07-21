import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  getAuthCookieDomain,
  getSupabaseAnonKey,
  getSupabaseUrl,
} from '../env';

export function createBrowserClient(): SupabaseClient {
  const cookieDomain = getAuthCookieDomain();

  return createSupabaseBrowserClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookieOptions: cookieDomain
      ? {
          domain: cookieDomain,
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        }
      : undefined,
  });
}
