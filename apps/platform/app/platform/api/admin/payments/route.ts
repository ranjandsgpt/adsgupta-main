import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@adsgupta/auth/nextauth';
import { isPlatformAdminEmail } from '@adsgupta/auth';
import { isIdentityConfigured } from '@adsgupta/identity';

/** Payments require Supabase identity; degrade gracefully without it. */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isPlatformAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!isIdentityConfigured()) {
    return NextResponse.json({
      payments: [],
      notice: 'Supabase identity is not configured on this host yet.',
    });
  }

  try {
    const { GET: identityGet } = await import(
      '@adsgupta/identity/api/admin/payments/route'
    );
    return await identityGet();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to list payments';
    return NextResponse.json({ payments: [], error: message }, { status: 503 });
  }
}
