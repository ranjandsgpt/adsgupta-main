import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import {
  createServiceClient,
  getAppSlug,
  requireRole,
  writeAuditLog,
} from '../../../server';
import type { AppRole } from '../../../types';

export async function GET() {
  const auth = await requireRole(['admin']);
  if (!auth.ok) return auth.response;

  try {
    const supabase = createServiceClient();
    const { data: app } = await supabase
      .from('apps')
      .select('id')
      .eq('slug', getAppSlug())
      .maybeSingle();

    if (!app) {
      return NextResponse.json({ error: 'App not configured' }, { status: 503 });
    }

    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('app_id', app.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return NextResponse.json({ invitations: data ?? [] });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to list invitations';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireRole(['admin']);
  if (!auth.ok) return auth.response;

  try {
    const body = (await req.json()) as {
      email?: string;
      role?: AppRole;
      expires_in_hours?: number;
    };

    const email = body.email?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: 'email required' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: app } = await supabase
      .from('apps')
      .select('id')
      .eq('slug', getAppSlug())
      .maybeSingle();

    if (!app) {
      return NextResponse.json({ error: 'App not configured' }, { status: 503 });
    }

    const token = randomBytes(24).toString('hex');
    const hours = body.expires_in_hours ?? 168;
    const expiresAt = new Date(Date.now() + hours * 3600 * 1000).toISOString();

    const { data, error } = await supabase
      .from('invitations')
      .insert({
        app_id: app.id,
        email,
        role: body.role ?? 'subscriber',
        token,
        invited_by: auth.context.user.id,
        expires_at: expiresAt,
      })
      .select('*')
      .single();

    if (error) throw error;

    await writeAuditLog({
      actorId: auth.context.user.id,
      action: 'admin.invitation.created',
      targetType: 'invitation',
      targetId: data.id,
      appId: app.id,
      metadata: { email },
    });

    return NextResponse.json({ invitation: data });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to create invitation';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
