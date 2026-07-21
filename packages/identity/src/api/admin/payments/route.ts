import { NextResponse } from 'next/server';
import { createServiceClient, getAppSlug, requireRole } from '../../../server';

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
      .from('payments')
      .select('*')
      .eq('app_id', app.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return NextResponse.json({ payments: data ?? [] });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to list payments';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
