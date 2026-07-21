export type AppRole = 'admin' | 'subscriber' | 'freebie';

export type MemberStatus =
  | 'pending_approval'
  | 'awaiting_payment'
  | 'active'
  | 'expired'
  | 'rejected'
  | 'suspended';

export type PaymentStatus =
  | 'created'
  | 'authorized'
  | 'captured'
  | 'failed'
  | 'refunded';

export type AppSlug = 'audit-tool' | 'exchange' | 'blog' | (string & {});

export type MembershipTrack = 'freebie' | 'subscriber';

export interface AppRecord {
  id: string;
  slug: AppSlug;
  name: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  id: string;
  user_id: string;
  app_id: string;
  role: AppRole;
  status: MemberStatus;
  track: MembershipTrack;
  approved_at: string | null;
  rejected_at: string | null;
  created_at: string;
  updated_at: string;
  app?: AppRecord;
}

export interface Plan {
  id: string;
  app_id: string;
  slug: string;
  name: string;
  amount_paise: number;
  duration_hours: number;
  active: boolean;
  created_at: string;
}

export interface Entitlement {
  id: string;
  user_id: string;
  app_id: string;
  source_payment_id: string | null;
  source_payment: string | null;
  granted_at: string;
  expires_at: string;
  revoked_at: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  app_id: string;
  plan_id: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_qr_id: string | null;
  amount_paise: number;
  currency: string;
  method: string | null;
  status: PaymentStatus;
  captured_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AccessCheckResult {
  allowed: boolean;
  reason:
    | 'admin'
    | 'subscriber'
    | 'freebie'
    | 'no_membership'
    | 'pending_approval'
    | 'awaiting_payment'
    | 'rejected'
    | 'expired'
    | 'no_entitlement'
    | 'freebie_disabled';
  role: AppRole | null;
  entitlement: Entitlement | null;
  freebieDailyRemaining?: number;
}

export interface MeResponse {
  user: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  app: AppRecord;
  membership: Membership | null;
  entitlement: Entitlement | null;
  access: AccessCheckResult;
  plan: Plan | null;
}
