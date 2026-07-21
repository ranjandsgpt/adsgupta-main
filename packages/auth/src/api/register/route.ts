import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { createUser, findUserByEmail, isAuthStoreConfigured } from '../../lib/users';

export async function POST(req: Request) {
  try {
    if (!isAuthStoreConfigured()) {
      return NextResponse.json(
        {
          error:
            'Registration is unavailable until AUTH_DATABASE_URL (or Supabase) is configured.',
        },
        { status: 503 }
      );
    }

    const body = (await req.json()) as {
      email?: string;
      password?: string;
      name?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const password = body.password || '';
    const name = body.name?.trim() || null;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await createUser({ email, passwordHash, name });

    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
