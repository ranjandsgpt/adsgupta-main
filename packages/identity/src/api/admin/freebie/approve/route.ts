import { NextResponse } from 'next/server';
import { approveFreebie, requireRole } from '../../../../server';

export async function POST(req: Request) {
  const auth = await requireRole(['admin']);
  if (!auth.ok) return auth.response;

  try {
    const body = (await req.json()) as { membership_id?: string };
    const membershipId = body.membership_id?.trim();

    if (!membershipId) {
      return NextResponse.json({ error: 'membership_id is required' }, { status: 400 });
    }

    const membership = await approveFreebie(membershipId, auth.context.user.id);
    return NextResponse.json({ membership });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to approve freebie';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
