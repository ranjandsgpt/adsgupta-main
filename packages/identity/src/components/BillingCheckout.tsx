'use client';

import { useCallback, useEffect, useState } from 'react';
import { useEntitlement } from '../hooks/useUser';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

function loadRazorpayScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.Razorpay) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-razorpay="checkout"]'
    );
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () =>
        reject(new Error('Failed to load Razorpay'))
      );
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpay = 'checkout';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.body.appendChild(script);
  });
}

export function BillingCheckout({
  onActivated,
}: {
  onActivated?: () => void;
}) {
  const { me, refresh, access } = useEntitlement(0);
  const [busy, setBusy] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const amount =
    me?.plan?.amount_paise ??
    Number(process.env.NEXT_PUBLIC_PASS_AMOUNT_PAISE || 50000);

  useEffect(() => {
    if (!polling) return;
    const id = window.setInterval(async () => {
      const next = await refresh();
      if (next?.access?.allowed) {
        setPolling(false);
        setMessage('Access activated.');
        onActivated?.();
      }
    }, 2500);
    return () => window.clearInterval(id);
  }, [polling, refresh, onActivated]);

  const startCheckout = useCallback(async () => {
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      await loadRazorpayScript();

      const orderRes = await fetch('/api/billing/order', {
        method: 'POST',
        credentials: 'include',
      });
      const orderBody = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderBody.error || 'Failed to create order');
      }

      const key =
        orderBody.key_id ||
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        '';

      if (!window.Razorpay) {
        throw new Error('Razorpay checkout unavailable');
      }

      const rzp = new window.Razorpay({
        key,
        amount: orderBody.amount_paise ?? amount,
        currency: 'INR',
        name: me?.app?.name || 'AdsGupta',
        description: '72-hour access pass',
        order_id: orderBody.order.id,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch('/api/billing/verify', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });
          const verifyBody = await verifyRes.json();
          if (!verifyRes.ok) {
            setError(verifyBody.error || 'Verification failed');
            return;
          }
          setMessage(
            'Payment authorized. Waiting for confirmation to activate access…'
          );
          setPolling(true);
        },
      });

      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setBusy(false);
    }
  }, [amount, me?.app?.name]);

  if (access?.allowed) {
    return (
      <div className="identity-card identity-billing">
        <p className="identity-success">You already have access.</p>
      </div>
    );
  }

  return (
    <div className="identity-card identity-billing space-y-3">
      <h2 className="identity-title">Unlock 72-hour pass</h2>
      <p className="identity-muted">
        ₹{(amount / 100).toFixed(0)} · activates after Razorpay confirms payment
      </p>
      {error ? <p className="identity-error">{error}</p> : null}
      {message ? <p className="identity-success">{message}</p> : null}
      <button
        type="button"
        className="identity-btn"
        disabled={busy || polling}
        onClick={() => void startCheckout()}
      >
        {busy ? 'Starting…' : polling ? 'Waiting for activation…' : 'Pay with Razorpay'}
      </button>
    </div>
  );
}
