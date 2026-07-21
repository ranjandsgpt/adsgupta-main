import { NextResponse } from 'next/server';
import {
  createServiceClient,
  requireAuth,
  writeAuditLog,
} from '../../../../server';

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  try {
    const body = (await req.json()) as { token?: string };
    const token = body.token?.trim();
    if (!token) {
      return NextResponse.json({ error: 'token required' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: invitation, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', token)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) throw error;
    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found or expired' },
        { status: 404 }
      );
    }

    const email = auth.context.user.email?.toLowerCase();
    if (email && invitation.email.toLowerCase() !== email) {
      return NextResponse.json(
        { error: 'Invitation email does not match signed-in user' },
        { status: 403 }
      );
    }

    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .upsert(
        {
          user_id: auth.context.user.id,
          app_id: invitation.app_id,
          role: invitation.role,
          status: 'active',
          track: invitation.role === 'freebie' ? 'freebie' : 'subscriber',
          approved_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,app_id' }
      )
      .select('*, app:apps(*)')
      .single();

    if (membershipError) throw membershipError;

    await supabase
      .from('invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invitation.id);

    await writeAuditLog({
      actorId: auth.context.user.id,
      action: 'invitation.accepted',
      targetType: 'invitation',
      targetId: invitation.id,
      appId: invitation.app_id,
    });

    return NextResponse.json({ membership });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to accept invitation';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
