'use client';

import type { ReactNode } from 'react';
import { useEntitlement } from '../hooks/useUser';
import { BillingCheckout } from './BillingCheckout';
import { useIdentityAuth } from './AuthProvider';

export function AccessGate({
  children,
  loadingFallback,
}: {
  children: ReactNode;
  loadingFallback?: ReactNode;
}) {
  const { loading: authLoading } = useIdentityAuth();
  const { access, membership, loading, refresh } = useEntitlement();

  if (authLoading || loading) {
    return (
      loadingFallback ?? (
        <div className="identity-loading flex min-h-[40vh] items-center justify-center text-sm opacity-70">
          Checking access…
        </div>
      )
    );
  }

  if (access?.allowed) {
    return <>{children}</>;
  }

  const reason = access?.reason;

  if (reason === 'pending_approval') {
    return (
      <div className="identity-card mx-auto mt-16 max-w-lg space-y-2">
        <h2 className="identity-title">Pending approval</h2>
        <p className="identity-muted">
          Your freebie request is waiting for an admin. You will get access once
          approved.
        </p>
      </div>
    );
  }

  if (reason === 'rejected') {
    return (
      <div className="identity-card mx-auto mt-16 max-w-lg space-y-2">
        <h2 className="identity-title">Request rejected</h2>
        <p className="identity-muted">
          Your freebie request was rejected. Contact support or purchase a pass.
        </p>
        <BillingCheckout onActivated={() => void refresh()} />
      </div>
    );
  }

  if (reason === 'freebie_disabled') {
    return (
      <div className="identity-card mx-auto mt-16 max-w-lg space-y-2">
        <h2 className="identity-title">Freebie unavailable</h2>
        <p className="identity-muted">
          Freebie access is currently disabled. Purchase a 72-hour pass to
          continue.
        </p>
        <BillingCheckout onActivated={() => void refresh()} />
      </div>
    );
  }

  return (
    <div className="identity-paywall mx-auto mt-16 max-w-lg space-y-4 px-4">
      <div className="identity-card space-y-2">
        <h2 className="identity-title">Access required</h2>
        <p className="identity-muted">
          {reason === 'awaiting_payment' || membership?.status === 'awaiting_payment'
            ? 'Complete payment to activate your subscriber pass.'
            : reason === 'expired' || reason === 'no_entitlement'
              ? 'Your pass has expired or is missing. Renew to continue.'
              : 'Sign up as a subscriber and purchase a 72-hour pass.'}
        </p>
      </div>
      <BillingCheckout onActivated={() => void refresh()} />
    </div>
  );
}
