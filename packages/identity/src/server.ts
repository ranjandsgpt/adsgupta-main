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
} from './lib/env';

export { createServiceClient } from './lib/supabase/admin';
export { createServerClient } from './lib/supabase/server';

export {
  computeExpiresAt,
  expireStaleMemberships,
  getActiveEntitlement,
  grantOrExtendEntitlement,
  revokeEntitlementByPayment,
} from './lib/entitlements';

export {
  activateSubscriberMembership,
  approveFreebie,
  ensureMembershipAfterRegister,
  getAppBySlug,
  getMembership,
  rejectFreebie,
  setMembershipRole,
  suspendMembership,
} from './lib/memberships';

export { writeAuditLog } from './lib/audit-log';
export { checkAccess, recordFreebieUsage } from './lib/access';

export {
  createOrder,
  createQr,
  fetchPayment,
  verifyCheckoutSignature,
  verifyWebhookSignature,
} from './lib/razorpay';

export {
  assertPassAmount,
  shouldShortCircuitWebhookEvent,
} from './lib/webhook-utils';

export {
  jsonGuardError,
  requireActiveEntitlement,
  requireAuth,
  requireRole,
} from './middleware/guards';

export type { AuthContext, GuardResult } from './middleware/guards';
