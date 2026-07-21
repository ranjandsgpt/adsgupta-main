import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import {
  createServiceClient,
  ensureMembershipAfterRegister,
  getAppSlug,
  requireRole,
  writeAuditLog,
} from '../../../server';
import type { MembershipTrack } from '../../../types';

/** Create a user (admin) via Supabase Auth admin API + membership. */
export async function POST(req: Request) {
  const auth = await requireRole(['admin']);
  if (!auth.ok) return auth.response;

  try {
    const body = (await req.json()) as {
      email?: string;
      password?: string;
      full_name?: string;
      track?: MembershipTrack;
      app_slug?: string;
    };

    const email = body.email?.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const password = body.password || `Tmp-${randomUUID().slice(0, 12)}!aA1`;

    const { data: created, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: body.full_name ?? null },
    });

    if (error || !created.user) {
      return NextResponse.json(
        { error: error?.message || 'Failed to create user' },
        { status: 400 }
      );
    }

    const track = body.track === 'freebie' ? 'freebie' : 'subscriber';
    const membership = await ensureMembershipAfterRegister(
      created.user.id,
      body.app_slug || getAppSlug(),
      track
    );

    await writeAuditLog({
      actorId: auth.context.user.id,
      action: 'admin.user.created',
      targetType: 'user',
      targetId: created.user.id,
      appId: membership.app_id,
      metadata: { email, track },
    });

    return NextResponse.json({
      user: { id: created.user.id, email },
      membership,
      temporary_password: body.password ? undefined : password,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create user';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const auth = await requireRole(['admin']);
  if (!auth.ok) return auth.response;

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    return NextResponse.json({ users: data ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to list users';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
