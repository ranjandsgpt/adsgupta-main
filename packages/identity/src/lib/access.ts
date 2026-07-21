import type { AccessCheckResult, AppRole, Entitlement } from '../types';
import { getFreebieDailyLimit, isFreebieEnabled } from './env';
import { getActiveEntitlement } from './entitlements';
import { getMembership } from './memberships';
import { createServiceClient } from './supabase/admin';

export async function checkAccess(
  userId: string,
  appSlug: string
): Promise<AccessCheckResult> {
  const membership = await getMembership(userId, appSlug);

  if (!membership) {
    return {
      allowed: false,
      reason: 'no_membership',
      role: null,
      entitlement: null,
    };
  }

  const role = membership.role as AppRole;
  const entitlement = await getActiveEntitlement(userId, appSlug);

  if (role === 'admin' && membership.status === 'active') {
    return {
      allowed: true,
      reason: 'admin',
      role,
      entitlement,
    };
  }

  if (membership.status === 'pending_approval') {
    return {
      allowed: false,
      reason: 'pending_approval',
      role,
      entitlement,
    };
  }

  if (membership.status === 'awaiting_payment') {
    return {
      allowed: false,
      reason: 'awaiting_payment',
      role,
      entitlement,
    };
  }

  if (membership.status === 'rejected') {
    return {
      allowed: false,
      reason: 'rejected',
      role,
      entitlement,
    };
  }

  if (membership.status === 'expired' || membership.status === 'suspended') {
    return {
      allowed: false,
      reason: 'expired',
      role,
      entitlement,
    };
  }

  if (role === 'subscriber' && membership.status === 'active') {
    if (entitlement) {
      return {
        allowed: true,
        reason: 'subscriber',
        role,
        entitlement,
      };
    }

    return {
      allowed: false,
      reason: 'no_entitlement',
      role,
      entitlement: null,
    };
  }

  if (role === 'freebie' && membership.status === 'active') {
    if (!isFreebieEnabled()) {
      return {
        allowed: false,
        reason: 'freebie_disabled',
        role,
        entitlement,
      };
    }

    const dailyLimit = getFreebieDailyLimit();
    let freebieDailyRemaining: number | undefined;

    if (dailyLimit !== null) {
      const remaining = await getFreebieDailyRemaining(
        userId,
        membership.app_id,
        dailyLimit
      );
      freebieDailyRemaining = remaining;

      if (remaining <= 0) {
        return {
          allowed: false,
          reason: 'no_entitlement',
          role,
          entitlement,
          freebieDailyRemaining: 0,
        };
      }
    }

    return {
      allowed: true,
      reason: 'freebie',
      role,
      entitlement,
      freebieDailyRemaining,
    };
  }

  return {
    allowed: false,
    reason: 'no_membership',
    role,
    entitlement,
  };
}

async function getFreebieDailyRemaining(
  userId: string,
  appId: string,
  dailyLimit: number
): Promise<number> {
  const supabase = createServiceClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('freebie_usage')
    .select('count')
    .eq('user_id', userId)
    .eq('app_id', appId)
    .eq('usage_date', today)
    .maybeSingle();

  if (error) throw error;
  const used = data?.count ?? 0;
  return Math.max(0, dailyLimit - used);
}

export async function recordFreebieUsage(
  userId: string,
  appId: string
): Promise<void> {
  const supabase = createServiceClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: existing, error: readError } = await supabase
    .from('freebie_usage')
    .select('id, count')
    .eq('user_id', userId)
    .eq('app_id', appId)
    .eq('usage_date', today)
    .maybeSingle();

  if (readError) throw readError;

  if (existing) {
    const { error } = await supabase
      .from('freebie_usage')
      .update({ count: existing.count + 1 })
      .eq('id', existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from('freebie_usage').insert({
    user_id: userId,
    app_id: appId,
    usage_date: today,
    count: 1,
  });

  if (error) throw error;
}

export type { Entitlement };
