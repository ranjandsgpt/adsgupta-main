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

    let query = supabase
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (app) {
      query = query.eq('app_id', app.id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ events: data ?? [] });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to list audit log';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
