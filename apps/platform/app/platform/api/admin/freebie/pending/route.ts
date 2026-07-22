import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@adsgupta/auth/nextauth';
import { isPlatformAdminEmail } from '@adsgupta/auth';
import { isIdentityConfigured } from '@adsgupta/identity';

/**
 * Freebie queue requires Supabase identity. Until that is configured,
 * return an empty list so the NextAuth admin console still loads.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isPlatformAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!isIdentityConfigured()) {
    return NextResponse.json({
      memberships: [],
      notice: 'Supabase identity is not configured on this host yet.',
    });
  }

  try {
    const { GET: identityGet } = await import(
      '@adsgupta/identity/api/admin/freebie/pending/route'
    );
    return await identityGet();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to list freebies';
    return NextResponse.json({ memberships: [], error: message }, { status: 503 });
  }
}
