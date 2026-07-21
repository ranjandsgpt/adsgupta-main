import { NextResponse } from 'next/server';
import { createServerClient } from '../../../server';

/**
 * Supabase OAuth / magic-link callback.
 * Mount at app/api/auth/callback/route.ts
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') || '/';

  if (code) {
    const supabase = await createServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
