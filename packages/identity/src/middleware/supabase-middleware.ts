import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js middleware helper — refresh Supabase session cookies.
 *
 * ```ts
 * // middleware.ts
 * import { updateSession } from '@adsgupta/identity/middleware';
 * export async function middleware(request: NextRequest) {
 *   return updateSession(request);
 * }
 * export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
 * ```
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anon =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !anon) return response;

  const cookieDomain =
    process.env.AUTH_COOKIE_DOMAIN || '.adsgupta.com';

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, {
            ...(options as object),
            domain: (options?.domain as string | undefined) ?? cookieDomain,
          });
        }
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}
