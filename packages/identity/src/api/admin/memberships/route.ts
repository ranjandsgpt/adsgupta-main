import { NextResponse } from 'next/server';
import {
  requireRole,
  setMembershipRole,
  suspendMembership,
} from '../../../server';
import type { AppRole } from '../../../types';

export async function PATCH(req: Request) {
  const auth = await requireRole(['admin']);
  if (!auth.ok) return auth.response;

  try {
    const body = (await req.json()) as {
      membership_id?: string;
      role?: AppRole;
      suspend?: boolean;
    };

    const membershipId = body.membership_id?.trim();
    if (!membershipId) {
      return NextResponse.json(
        { error: 'membership_id required' },
        { status: 400 }
      );
    }

    if (body.suspend) {
      const membership = await suspendMembership(
        membershipId,
        auth.context.user.id
      );
      return NextResponse.json({ membership });
    }

    if (!body.role) {
      return NextResponse.json(
        { error: 'role or suspend required' },
        { status: 400 }
      );
    }

    const membership = await setMembershipRole(
      membershipId,
      body.role,
      auth.context.user.id
    );
    return NextResponse.json({ membership });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to update membership';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
