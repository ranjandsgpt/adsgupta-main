import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import type { AppRole } from '../types';
import { getAppSlug } from '../lib/env';
import { checkAccess } from '../lib/access';
import { createServerClient } from '../lib/supabase/server';

export interface AuthContext {
  user: User;
  supabase: Awaited<ReturnType<typeof createServerClient>>;
}

export type GuardResult =
  | { ok: true; context: AuthContext }
  | { ok: false; response: NextResponse };

export async function requireAuth(): Promise<GuardResult> {
  const supabase = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Authentication required' }, { status: 401 }),
    };
  }

  return { ok: true, context: { user, supabase } };
}

export async function requireRole(
  roles: AppRole[],
  appSlug: string = getAppSlug()
): Promise<GuardResult> {
  const auth = await requireAuth();
  if (!auth.ok) return auth;

  const { data: app, error: appError } = await auth.context.supabase
    .from('apps')
    .select('id')
    .eq('slug', appSlug)
    .maybeSingle();

  if (appError) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Failed to load app' }, { status: 500 }),
    };
  }

  if (!app) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'App not configured' }, { status: 503 }),
    };
  }

  const { data: membership, error } = await auth.context.supabase
    .from('memberships')
    .select('role, status')
    .eq('user_id', auth.context.user.id)
    .eq('app_id', app.id)
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Failed to load membership' }, { status: 500 }),
    };
  }

  if (!membership || membership.status !== 'active') {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Active membership required' }, { status: 403 }),
    };
  }

  if (!roles.includes(membership.role as AppRole)) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Insufficient role' }, { status: 403 }),
    };
  }

  return auth;
}

export async function requireActiveEntitlement(
  appSlug: string = getAppSlug()
): Promise<GuardResult> {
  const auth = await requireAuth();
  if (!auth.ok) return auth;

  const access = await checkAccess(auth.context.user.id, appSlug);

  if (!access.allowed) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: 'Access denied',
          reason: access.reason,
        },
        { status: 403 }
      ),
    };
  }

  return auth;
}

export function jsonGuardError(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}
