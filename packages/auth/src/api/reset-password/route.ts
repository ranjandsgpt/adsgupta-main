import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { verifyPasswordResetToken } from '../../lib/reset-token';
import { updateUserPassword } from '../../lib/users';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { token?: string; password?: string };
    const token = body.token || '';
    const password = body.password || '';

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const parsed = verifyPasswordResetToken(token);
    if (!parsed) {
      return NextResponse.json(
        { error: 'Reset link is invalid or expired' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const ok = await updateUserPassword(parsed.email, passwordHash);
    if (!ok) {
      return NextResponse.json({ error: 'Unable to update password' }, { status: 400 });
    }

    return NextResponse.json({ ok: true, message: 'Password updated. You can sign in now.' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Reset failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
