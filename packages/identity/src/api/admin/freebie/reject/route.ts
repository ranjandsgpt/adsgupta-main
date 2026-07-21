import { NextResponse } from 'next/server';
import { rejectFreebie, requireRole } from '../../../../server';

export async function POST(req: Request) {
  const auth = await requireRole(['admin']);
  if (!auth.ok) return auth.response;

  try {
    const body = (await req.json()) as { membership_id?: string; reason?: string };
    const membershipId = body.membership_id?.trim();

    if (!membershipId) {
      return NextResponse.json({ error: 'membership_id is required' }, { status: 400 });
    }

    const membership = await rejectFreebie(
      membershipId,
      auth.context.user.id,
      body.reason?.trim()
    );
    return NextResponse.json({ membership });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to reject freebie';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
