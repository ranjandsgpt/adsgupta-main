import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@adsgupta/auth/nextauth';
import {
  getRolesForEmail,
  isPlatformAdmin,
  isPlatformAdminEmail,
} from '@adsgupta/auth';

/** Session + admin flag + app roles for the central platform hub. */
export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? null;
  const isAdmin = isPlatformAdminEmail(email) || (await isPlatformAdmin(email));

  let appRoles: Array<{
    appSlug: string;
    role: string;
    status: string;
  }> = [];

  if (email) {
    try {
      const roles = await getRolesForEmail(email);
      appRoles = roles.map((r) => ({
        appSlug: r.appSlug,
        role: r.role,
        status: r.status,
      }));
    } catch {
      // roles optional during bootstrap
    }
  }

  const sessionRoles =
    (session?.user as { appRoles?: Array<{ appSlug: string; role: string; status: string }> })
      ?.appRoles || [];

  if (!appRoles.length && sessionRoles.length) {
    appRoles = sessionRoles.map((r) => ({
      appSlug: r.appSlug,
      role: r.role,
      status: r.status,
    }));
  }

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
    appRoles,
  });
}
