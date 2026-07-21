import { NextResponse } from 'next/server';
import {
  checkAccess,
  createServerClient,
  getAppBySlug,
  getAppSlug,
  getActiveEntitlement,
  getMembership,
  getPassAmountPaise,
} from '../../server';

export async function GET() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const appSlug = getAppSlug();
    const app = await getAppBySlug(appSlug);
    if (!app) {
      return NextResponse.json({ error: 'App not configured' }, { status: 503 });
    }

    const [membership, entitlement, access, planResult] = await Promise.all([
      getMembership(user.id, appSlug),
      getActiveEntitlement(user.id, appSlug),
      checkAccess(user.id, appSlug),
      supabase
        .from('plans')
        .select('*')
        .eq('app_id', app.id)
        .eq('active', true)
        .order('amount_paise', { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);

    if (planResult.error) throw planResult.error;

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, email')
      .eq('id', user.id)
      .maybeSingle();

    return NextResponse.json({
      user: {
        id: user.id,
        email: profile?.email ?? user.email ?? '',
        full_name: profile?.full_name ?? null,
        avatar_url: profile?.avatar_url ?? null,
      },
      app,
      membership,
      entitlement,
      access,
      plan: planResult.data,
      billing: {
        pass_amount_paise: getPassAmountPaise(),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load profile';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
