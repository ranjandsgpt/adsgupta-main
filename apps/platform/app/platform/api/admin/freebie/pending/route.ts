import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@adsgupta/auth/nextauth';
import { isPlatformAdminEmail } from '@adsgupta/auth';
import { isIdentityConfigured } from '@adsgupta/identity';
import {
  createServiceClient,
  getAppSlug,
} from '@adsgupta/identity/server';

/** List pending freebies for NextAuth platform admins via service role. */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isPlatformAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!isIdentityConfigured()) {
    return NextResponse.json({
      memberships: [],
      notice: 'Supabase identity is not configured on this host yet.',
    });
  }

  try {
    const supabase = createServiceClient();
    const appSlug = getAppSlug();

    const { data: app } = await supabase
      .from('apps')
      .select('id')
      .eq('slug', appSlug)
      .maybeSingle();

    if (!app) {
      return NextResponse.json({
        memberships: [],
        notice:
          'Identity schema not migrated yet — run packages/identity/supabase/migrations/001_identity_core.sql in the Supabase SQL editor.',
      });
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
    const message = err instanceof Error ? err.message : 'Failed to list freebies';
    return NextResponse.json({ memberships: [], error: message }, { status: 503 });
  }
}
