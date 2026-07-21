export type {
  AccessCheckResult,
  AppRecord,
  AppRole,
  AppSlug,
  Entitlement,
  MeResponse,
  MemberStatus,
  Membership,
  MembershipTrack,
  Payment,
  PaymentStatus,
  Plan,
  Profile,
} from './types';

export {
  getAppSlug,
  getAuthCookieDomain,
  getPassAmountPaise,
  getPassDurationHours,
  isBillingQrEnabled,
  isFreebieEnabled,
  isIdentityConfigured,
} from './lib/env';

export { createBrowserClient } from './lib/supabase/browser';

export { AuthProvider, useIdentityAuth } from './components/AuthProvider';
export { IdentityGate } from './components/IdentityGate';
export { LoginPanel } from './components/LoginPanel';
export { BillingCheckout } from './components/BillingCheckout';
export { AccessGate } from './components/AccessGate';

export { useUser, useEntitlement } from './hooks/useUser';
