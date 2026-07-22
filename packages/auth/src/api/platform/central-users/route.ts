import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../nextauth';
import { isPlatformAdminEmail } from '../../../lib/platform-auth-url';
import {
  isPlatformAdmin,
  listCentralUsersWithRoles,
  updateCentralUserProfile,
  upsertUserAppRole,
} from '../../../lib/roles';
import { createPasswordResetToken } from '../../../lib/reset-token';
import { sendAuthEmail } from '../../../lib/email';

async function requirePlatformAdmin() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  const ok = isPlatformAdminEmail(email) || (await isPlatformAdmin(email));
  if (!ok) return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  return { email };
}

export async function GET() {
  const auth = await requirePlatformAdmin();
  if ('error' in auth && auth.error) return auth.error;

  try {
    const users = await listCentralUsersWithRoles(300);
    return NextResponse.json({
      users,
      stats: {
        total: users.length,
        withPassword: users.filter((u) => u.hasPassword).length,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Query failed';
    return NextResponse.json({ error: message, users: [] }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const auth = await requirePlatformAdmin();
  if ('error' in auth && auth.error) return auth.error;

  try {
    const body = (await req.json()) as {
      userId?: string;
      email?: string;
      name?: string | null;
      appSlug?: string;
      role?: string;
      status?: string;
      meta?: Record<string, unknown>;
      action?: 'update' | 'reset-password';
    };

    if (body.action === 'reset-password') {
      const email = body.email?.trim().toLowerCase();
      if (!email) {
        return NextResponse.json({ error: 'email required' }, { status: 400 });
      }
      const origin =
        process.env.NEXTAUTH_URL?.replace(/\/$/, '') ||
        process.env.NEXT_PUBLIC_PLATFORM_AUTH_URL?.replace(/\/platform\/usermanagement\/?$/, '') ||
        'https://adsgupta.com';
      const token = createPasswordResetToken(email);
      const resetUrl = `${origin}/platform/usermanagement?mode=reset&token=${encodeURIComponent(token)}`;
      await sendAuthEmail({
        to: email,
        subject: 'Reset your AdsGupta password',
        text: `Reset your password: ${resetUrl}\n\nThis link expires in 1 hour.`,
        html: `<p>Reset your AdsGupta password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
      });
      return NextResponse.json({
        ok: true,
        message: 'Password reset email sent (if mail is configured).',
      });
    }

    if (!body.userId && !body.email) {
      return NextResponse.json({ error: 'userId or email required' }, { status: 400 });
    }

    if (body.name !== undefined && body.userId) {
      await updateCentralUserProfile({ userId: body.userId, name: body.name });
    }

    if (body.appSlug && body.role) {
      const allowedApps = [
        'exchange',
        'blog',
        'marketplace',
        'platform',
        'pousali',
        'audit-tool',
      ];
      if (!allowedApps.includes(body.appSlug)) {
        return NextResponse.json({ error: 'Invalid appSlug' }, { status: 400 });
      }
      const updated = await upsertUserAppRole({
        userId: body.userId,
        email: body.email,
        appSlug: body.appSlug,
        role: body.role,
        status: body.status,
        meta: body.meta,
      });
      if (!updated) {
        return NextResponse.json({ error: 'Unable to update role' }, { status: 400 });
      }
      return NextResponse.json({ ok: true, role: updated });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Update failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
