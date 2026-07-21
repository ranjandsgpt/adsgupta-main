import type {
  AppRecord,
  AppRole,
  MemberStatus,
  Membership,
  MembershipTrack,
} from '../types';
import { writeAuditLog } from './audit-log';
import { createServiceClient } from './supabase/admin';

export async function getAppBySlug(slug: string): Promise<AppRecord | null> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('apps')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  return (data as AppRecord | null) ?? null;
}

export async function getMembership(
  userId: string,
  appSlug: string
): Promise<Membership | null> {
  const supabase = createServiceClient();
  const app = await getAppBySlug(appSlug);
  if (!app) return null;

  const { data, error } = await supabase
    .from('memberships')
    .select('*, app:apps(*)')
    .eq('user_id', userId)
    .eq('app_id', app.id)
    .maybeSingle();

  if (error) throw error;
  return (data as Membership | null) ?? null;
}

/**
 * After client-side Supabase signup, complete membership track selection.
 * freebie → pending_approval; subscriber → awaiting_payment.
 */
export async function ensureMembershipAfterRegister(
  userId: string,
  appSlug: string,
  track: MembershipTrack
): Promise<Membership> {
  const supabase = createServiceClient();
  const app = await getAppBySlug(appSlug);
  if (!app) {
    throw new Error(`Unknown app slug: ${appSlug}`);
  }

  const existing = await getMembership(userId, appSlug);
  if (existing) return existing;

  const role: AppRole = track === 'freebie' ? 'freebie' : 'subscriber';
  const status: MemberStatus =
    track === 'freebie' ? 'pending_approval' : 'awaiting_payment';

  const { data, error } = await supabase
    .from('memberships')
    .insert({
      user_id: userId,
      app_id: app.id,
      role,
      status,
      track,
    })
    .select('*, app:apps(*)')
    .single();

  if (error) {
    if (error.code === '23505') {
      const raced = await getMembership(userId, appSlug);
      if (raced) return raced;
    }
    throw error;
  }

  await writeAuditLog({
    actorId: userId,
    action: 'membership.created',
    targetType: 'membership',
    targetId: data.id,
    appId: app.id,
    metadata: { track, role, status },
  });

  return data as Membership;
}

export async function activateSubscriberMembership(
  userId: string,
  appId: string
): Promise<Membership | null> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('memberships')
    .update({
      role: 'subscriber',
      status: 'active',
      approved_at: new Date().toISOString(),
      rejected_at: null,
    })
    .eq('user_id', userId)
    .eq('app_id', appId)
    .select('*, app:apps(*)')
    .maybeSingle();

  if (error) throw error;
  return (data as Membership | null) ?? null;
}

export async function approveFreebie(
  membershipId: string,
  actorId: string
): Promise<Membership> {
  const supabase = createServiceClient();
  const approvedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from('memberships')
    .update({
      status: 'active',
      approved_at: approvedAt,
      rejected_at: null,
    })
    .eq('id', membershipId)
    .eq('track', 'freebie')
    .in('status', ['pending_approval', 'rejected'])
    .select('*, app:apps(*)')
    .single();

  if (error) throw error;

  await writeAuditLog({
    actorId,
    action: 'membership.freebie.approved',
    targetType: 'membership',
    targetId: membershipId,
    appId: data.app_id,
  });

  return data as Membership;
}

export async function rejectFreebie(
  membershipId: string,
  actorId: string,
  reason?: string
): Promise<Membership> {
  const supabase = createServiceClient();
  const rejectedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from('memberships')
    .update({
      status: 'rejected',
      rejected_at: rejectedAt,
    })
    .eq('id', membershipId)
    .eq('track', 'freebie')
    .select('*, app:apps(*)')
    .single();

  if (error) throw error;

  await writeAuditLog({
    actorId,
    action: 'membership.freebie.rejected',
    targetType: 'membership',
    targetId: membershipId,
    appId: data.app_id,
    metadata: reason ? { reason } : {},
  });

  return data as Membership;
}

export async function setMembershipRole(
  membershipId: string,
  role: AppRole,
  actorId: string
): Promise<Membership> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('memberships')
    .update({ role })
    .eq('id', membershipId)
    .select('*, app:apps(*)')
    .single();
  if (error) throw error;

  await writeAuditLog({
    actorId,
    action: 'membership.role.updated',
    targetType: 'membership',
    targetId: membershipId,
    appId: data.app_id,
    metadata: { role },
  });

  return data as Membership;
}

export async function suspendMembership(
  membershipId: string,
  actorId: string
): Promise<Membership> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('memberships')
    .update({ status: 'suspended' })
    .eq('id', membershipId)
    .select('*, app:apps(*)')
    .single();
  if (error) throw error;

  await writeAuditLog({
    actorId,
    action: 'membership.suspended',
    targetType: 'membership',
    targetId: membershipId,
    appId: data.app_id,
  });

  return data as Membership;
}
