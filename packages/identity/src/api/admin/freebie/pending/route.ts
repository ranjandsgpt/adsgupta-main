import { NextResponse } from 'next/server';
import { createServiceClient, getAppSlug, requireRole } from '../../../../server';

export async function GET() {
  const auth = await requireRole(['admin']);
  if (!auth.ok) return auth.response;

  try {
    const supabase = createServiceClient();
    const appSlug = getAppSlug();

    const { data: app } = await supabase
      .from('apps')
      .select('id')
      .eq('slug', appSlug)
      .maybeSingle();

    if (!app) {
      return NextResponse.json({ error: 'App not configured' }, { status: 503 });
    }

    const { data, error } = await supabase
      .from('memberships')
      .select('*, profile:profiles(email, full_name), app:apps(slug, name)')
      .eq('app_id', app.id)
      .eq('track', 'freebie')
      .eq('status', 'pending_approval')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ memberships: data ?? [] });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to list pending freebies';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
