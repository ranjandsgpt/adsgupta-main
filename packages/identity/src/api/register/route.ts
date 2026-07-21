import { NextResponse } from 'next/server';
import {
  ensureMembershipAfterRegister,
  getAppSlug,
  requireAuth,
} from '../../server';
import type { MembershipTrack } from '../../types';

/**
 * Completes membership track selection after client-side Supabase signup.
 * Body: { track: 'freebie' | 'subscriber', app_slug?: string }
 */
export async function POST(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  try {
    const body = (await req.json()) as {
      track?: MembershipTrack;
      app_slug?: string;
    };

    const track = body.track;
    if (track !== 'freebie' && track !== 'subscriber') {
      return NextResponse.json(
        { error: "track must be 'freebie' or 'subscriber'" },
        { status: 400 }
      );
    }

    const membership = await ensureMembershipAfterRegister(
      auth.context.user.id,
      body.app_slug || getAppSlug(),
      track
    );

    return NextResponse.json({ membership });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to complete registration';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
