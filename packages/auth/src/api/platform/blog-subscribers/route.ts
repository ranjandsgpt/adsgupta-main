import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../nextauth';
import { isPlatformAdminEmail } from '../../../lib/platform-auth-url';
import {
  isPlatformAdmin,
  listBlogSubscribers,
  updateBlogSubscriberStatus,
} from '../../../lib/roles';

async function requirePlatformAdmin() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  const ok = isPlatformAdminEmail(email) || (await isPlatformAdmin(email));
  if (!ok) return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  return { email };
}

export async function GET(req: Request) {
  const auth = await requirePlatformAdmin();
  if ('error' in auth && auth.error) return auth.error;

  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || undefined;
    const subscribers = await listBlogSubscribers({ status, limit: 1000 });
    return NextResponse.json({
      subscribers,
      stats: {
        total: subscribers.length,
        active: subscribers.filter((s) => s.status === 'active').length,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Query failed';
    return NextResponse.json({ error: message, subscribers: [] }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const auth = await requirePlatformAdmin();
  if ('error' in auth && auth.error) return auth.error;

  try {
    const body = (await req.json()) as { id?: string; status?: string };
    if (!body.id || !body.status) {
      return NextResponse.json({ error: 'id and status required' }, { status: 400 });
    }
    if (!['active', 'unsubscribed', 'bounced'].includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    const ok = await updateBlogSubscriberStatus(body.id, body.status);
    if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Update failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
