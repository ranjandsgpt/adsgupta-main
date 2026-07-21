import { NextResponse } from 'next/server';
import { sendAuthEmail } from '../../lib/email';
import { createPasswordResetToken } from '../../lib/reset-token';
import { findUserByEmail } from '../../lib/users';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; appUrl?: string };
    const email = body.email?.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // Always return success to avoid email enumeration
    const generic = {
      ok: true,
      message: 'If an account exists for that email, a reset link has been sent.',
    };

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(generic);
    }

    const origin =
      body.appUrl?.replace(/\/$/, '') ||
      process.env.NEXTAUTH_URL?.replace(/\/$/, '') ||
      new URL(req.url).origin;

    const token = createPasswordResetToken(email);
    const resetUrl = `${origin}/login?mode=reset&token=${encodeURIComponent(token)}`;

    const emailResult = await sendAuthEmail({
      to: email,
      subject: 'Reset your AdsGupta password',
      text: `Reset your password: ${resetUrl}\n\nThis link expires in 1 hour.`,
      html: `<p>Reset your AdsGupta password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 1 hour.</p>`,
    });

    if (!emailResult.sent && process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        ...generic,
        // Dev-only convenience when Resend is not configured
        resetUrl,
        emailSkipped: emailResult.reason,
      });
    }

    return NextResponse.json(generic);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Request failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
