import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@adsgupta/auth/nextauth';
import { isPlatformAdminEmail } from '@adsgupta/auth';
import { isIdentityConfigured } from '@adsgupta/identity';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!isPlatformAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!isIdentityConfigured()) {
    return NextResponse.json(
      { error: 'Supabase identity is not configured on this host yet.' },
      { status: 503 }
    );
  }
  try {
    const { POST: identityPost } = await import(
      '@adsgupta/identity/api/admin/freebie/approve/route'
    );
    return await identityPost(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Approve failed';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
