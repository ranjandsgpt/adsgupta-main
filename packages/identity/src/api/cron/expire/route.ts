import { NextResponse } from 'next/server';
import { expireStaleMemberships } from '../../../server';

export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  const header =
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
    req.headers.get('x-cron-secret');

  if (!secret || header !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const expired = await expireStaleMemberships();
    return NextResponse.json({ ok: true, expired });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to expire memberships';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return POST(req);
}
