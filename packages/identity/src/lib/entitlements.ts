import type { Entitlement } from '../types';
import { createServiceClient } from './supabase/admin';

export interface GrantEntitlementInput {
  userId: string;
  appId: string;
  /** Internal payments.id UUID (optional) */
  paymentId?: string | null;
  /** Razorpay payment id — preferred idempotency key */
  razorpayPaymentId: string;
  capturedAt: Date;
  durationHours: number;
}

/** Pure helper: expires_at = max(now, currentExpiresAt ?? capturedAt) + durationHours */
export function computeExpiresAt(
  now: Date,
  currentExpiresAt: Date | string | null | undefined,
  durationHours: number,
  capturedAt: Date
): Date {
  const durationMs = durationHours * 60 * 60 * 1000;
  const currentMs = currentExpiresAt
    ? new Date(currentExpiresAt).getTime()
    : null;
  const baseMs =
    currentMs != null
      ? Math.max(now.getTime(), currentMs)
      : Math.max(now.getTime(), capturedAt.getTime());
  return new Date(baseMs + durationMs);
}

export async function getActiveEntitlement(
  userId: string,
  appSlug: string
): Promise<Entitlement | null> {
  const supabase = createServiceClient();
  const now = new Date().toISOString();

  const { data: app, error: appError } = await supabase
    .from('apps')
    .select('id')
    .eq('slug', appSlug)
    .maybeSingle();

  if (appError) throw appError;
  if (!app) return null;

  const { data, error } = await supabase
    .from('entitlements')
    .select('*')
    .eq('user_id', userId)
    .eq('app_id', app.id)
    .is('revoked_at', null)
    .gt('expires_at', now)
    .order('expires_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data as Entitlement | null) ?? null;
}

export async function grantOrExtendEntitlement(
  input: GrantEntitlementInput
): Promise<Entitlement> {
  const supabase = createServiceClient();
  const {
    userId,
    appId,
    paymentId,
    razorpayPaymentId,
    capturedAt,
    durationHours,
  } = input;

  const { data: existingByRzp, error: existingError } = await supabase
    .from('entitlements')
    .select('*')
    .eq('source_payment', razorpayPaymentId)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existingByRzp) return existingByRzp as Entitlement;

  if (paymentId) {
    const { data: existingByUuid, error: uuidError } = await supabase
      .from('entitlements')
      .select('*')
      .eq('source_payment_id', paymentId)
      .maybeSingle();
    if (uuidError) throw uuidError;
    if (existingByUuid) return existingByUuid as Entitlement;
  }

  const now = new Date();

  const { data: current, error: currentError } = await supabase
    .from('entitlements')
    .select('*')
    .eq('user_id', userId)
    .eq('app_id', appId)
    .is('revoked_at', null)
    .gt('expires_at', now.toISOString())
    .order('expires_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (currentError) throw currentError;

  const expiresAt = computeExpiresAt(
    now,
    current?.expires_at,
    durationHours,
    capturedAt
  );
  const grantedAt = now.toISOString();

  const { data, error } = await supabase
    .from('entitlements')
    .insert({
      user_id: userId,
      app_id: appId,
      source_payment_id: paymentId ?? null,
      source_payment: razorpayPaymentId,
      granted_at: grantedAt,
      expires_at: expiresAt.toISOString(),
    })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      const { data: raced, error: raceError } = await supabase
        .from('entitlements')
        .select('*')
        .eq('source_payment', razorpayPaymentId)
        .single();
      if (raceError) throw raceError;
      return raced as Entitlement;
    }
    throw error;
  }

  return data as Entitlement;
}

export async function revokeEntitlementByPayment(
  razorpayPaymentIdOrUuid: string
): Promise<Entitlement | null> {
  const supabase = createServiceClient();
  const revokedAt = new Date().toISOString();

  const { data: bySource, error: bySourceError } = await supabase
    .from('entitlements')
    .update({ revoked_at: revokedAt })
    .eq('source_payment', razorpayPaymentIdOrUuid)
    .is('revoked_at', null)
    .select('*')
    .maybeSingle();

  if (bySourceError) throw bySourceError;
  if (bySource) return bySource as Entitlement;

  const { data, error } = await supabase
    .from('entitlements')
    .update({ revoked_at: revokedAt })
    .eq('source_payment_id', razorpayPaymentIdOrUuid)
    .is('revoked_at', null)
    .select('*')
    .maybeSingle();

  if (error) throw error;
  return (data as Entitlement | null) ?? null;
}

export async function expireStaleMemberships(): Promise<number> {
  const supabase = createServiceClient();
  const now = new Date().toISOString();

  const { data: activeSubscribers, error: membershipError } = await supabase
    .from('memberships')
    .select('id, user_id, app_id')
    .eq('role', 'subscriber')
    .eq('status', 'active');

  if (membershipError) throw membershipError;
  if (!activeSubscribers?.length) return 0;

  let expiredCount = 0;

  for (const membership of activeSubscribers) {
    const { data: entitlement, error: entitlementError } = await supabase
      .from('entitlements')
      .select('expires_at')
      .eq('user_id', membership.user_id)
      .eq('app_id', membership.app_id)
      .is('revoked_at', null)
      .gt('expires_at', now)
      .limit(1)
      .maybeSingle();

    if (entitlementError) throw entitlementError;
    if (entitlement) continue;

    const { error: updateError } = await supabase
      .from('memberships')
      .update({ status: 'expired' })
      .eq('id', membership.id)
      .eq('status', 'active');

    if (updateError) throw updateError;
    expiredCount += 1;
  }

  return expiredCount;
}
