import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@adsgupta/auth/nextauth';
import { isPlatformAdmin, isPlatformAdminEmail } from '@adsgupta/auth';

/** Session + admin flag for the central platform hub (server-side admin check). */
export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? null;
  const isAdmin = isPlatformAdminEmail(email) || (await isPlatformAdmin(email));
  return NextResponse.json({
    authenticated: Boolean(session?.user),
    user: session?.user
      ? {
          id: (session.user as { id?: string }).id ?? email,
          email: session.user.email,
          name: session.user.name,
        }
      : null,
    isAdmin,
  });
}
