import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@adsgupta/auth/nextauth';
import { isPlatformAdminEmail } from '@adsgupta/auth';
import { isIdentityConfigured } from '@adsgupta/identity';
import {
  createServiceClient,
  getAppSlug,
} from '@adsgupta/identity/server';

/** List payments for NextAuth platform admins via service role. */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isPlatformAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!isIdentityConfigured()) {
    return NextResponse.json({
      payments: [],
      notice: 'Supabase identity is not configured on this host yet.',
    });
  }

  try {
    const supabase = createServiceClient();
    const { data: app } = await supabase
      .from('apps')
      .select('id')
      .eq('slug', getAppSlug())
      .maybeSingle();

    if (!app) {
      return NextResponse.json({
        payments: [],
        notice:
          'Identity schema not migrated yet — run packages/identity/supabase/migrations/001_identity_core.sql in the Supabase SQL editor.',
      });
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
    const message = err instanceof Error ? err.message : 'Failed to list payments';
    return NextResponse.json({ payments: [], error: message }, { status: 503 });
  }
}
