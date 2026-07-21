import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  getAuthCookieDomain,
  getSupabaseAnonKey,
  getSupabaseUrl,
} from '../env';

export async function createServerClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  const cookieDomain = getAuthCookieDomain();

  return createSupabaseServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Partial<ResponseCookie> }[]) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, {
              ...options,
              domain: options?.domain ?? cookieDomain,
              path: options?.path ?? '/',
              sameSite: options?.sameSite ?? 'lax',
              secure:
                options?.secure ?? process.env.NODE_ENV === 'production',
            });
          }
        } catch {
          // setAll can fail in Server Components; middleware handles refresh.
        }
      },
    },
    cookieOptions: {
      domain: cookieDomain,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
  });
}
