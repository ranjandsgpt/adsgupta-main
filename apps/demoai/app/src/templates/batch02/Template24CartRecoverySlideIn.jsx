import React, { useCallback, useEffect, useState } from 'react';
import { Clock, ShoppingCart, Tag } from 'lucide-react';
import { useDismissState } from '../hooks/useDismissState';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useViewability } from '../hooks/useViewability';
import { emitTelemetry } from '../telemetry';

const TEMPLATE_ID = 'cart-recovery';
// Production behaviour: slide in after ~30s of inactivity on the abandoned cart.
// The demo uses a 3s timer (with a visible note) so testers don't have to wait.
const DEMO_DELAY_MS = 3000;

const CART = [
  { id: 'mug', name: 'Terra Mug · Sand', price: 28, hue: 'from-amber-300 to-orange-500' },
  { id: 'press', name: 'Piston Press', price: 64, hue: 'from-slate-400 to-slate-700' },
];

export default function Template24CartRecoverySlideIn() {
  const reducedMotion = useReducedMotion();
  const viewabilityRef = useViewability({ templateId: TEMPLATE_ID });
  const handleDismiss = useCallback((reason) => {
    emitTelemetry('close', { templateId: TEMPLATE_ID, reason });
  }, []);
  const { dismissed, dismiss } = useDismissState({ key: TEMPLATE_ID, onDismiss: handleDismiss });

  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(Math.ceil(DEMO_DELAY_MS / 1000));
  const [recovered, setRecovered] = useState(false);

  useEffect(() => {
    if (dismissed) return undefined;
    const timer = window.setTimeout(() => {
      setVisible(true);
      emitTelemetry('expand', { templateId: TEMPLATE_ID, trigger: 'idle-timer' });
    }, DEMO_DELAY_MS);
    const ticker = window.setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(ticker);
    };
  }, [dismissed]);

  const total = CART.reduce((sum, item) => sum + item.price, 0);
  const discounted = Math.round(total * 0.9);

  const recover = () => {
    setRecovered(true);
    emitTelemetry('click', { templateId: TEMPLATE_ID, target: 'resume-checkout', total: discounted });
    emitTelemetry('complete', { templateId: TEMPLATE_ID, action: 'cart-recovered', total: discounted });
  };

  if (dismissed) return null;

  return (
    <div ref={viewabilityRef} className="relative mx-auto min-h-64 w-full max-w-md" aria-label="Cart recovery demo stage">
      {!visible && (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-700 p-6 text-center">
          <Clock className="text-slate-500" size={28} />
          <p className="text-sm text-slate-400">
            Simulating an abandoned cart&hellip; slide-in appears in <span className="font-bold text-white">{countdown}s</span>.
          </p>
          <p className="max-w-xs text-xs text-slate-500">
            Demo note: shortened to 3 seconds. In production this unit waits ~30 seconds of idle time
            before nudging the shopper.
          </p>
        </div>
      )}

      {visible && (
        <aside
          role="dialog"
          aria-label="Your cart is waiting"
          className={`w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl ${
            reducedMotion ? '' : 'animate-[cart-slide_420ms_cubic-bezier(0.22,1,0.36,1)]'
          }`}
        >
          <style>{'@keyframes cart-slide { from { transform: translateX(110%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }'}</style>
          <header className="flex min-h-14 items-center justify-between gap-3 border-b border-white/10 px-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="text-cyan-400" size={18} />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-400">Sponsored reminder</p>
                <h3 className="text-sm font-semibold text-white">Still thinking it over?</h3>
              </div>
            </div>
            <button
              type="button"
              onClick={() => dismiss('button')}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
              aria-label="Close reminder"
            >
              ✕
            </button>
          </header>

          <div className="space-y-2 p-4">
            {CART.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl bg-white/5 p-2.5">
                <div className={`h-11 w-11 rounded-lg bg-gradient-to-br ${item.hue}`} aria-hidden="true" />
                <p className="flex-1 text-sm font-semibold text-white">{item.name}</p>
                <p className="text-sm font-bold text-slate-300">${item.price}</p>
              </div>
            ))}
            <div className="flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 p-2.5 text-amber-300">
              <Tag size={16} />
              <p className="text-xs font-semibold">
                Come back now and save 10% &mdash; ${total} <s className="opacity-60">total</s> becomes ${discounted}.
              </p>
            </div>
            <button
              type="button"
              onClick={recover}
              className={`mt-1 min-h-12 w-full rounded-xl font-bold transition-colors ${
                recovered ? 'bg-emerald-400 text-slate-950' : 'bg-cyan-400 text-slate-950 hover:bg-cyan-300'
              }`}
            >
              {recovered ? 'Checkout resumed ✓' : `Resume checkout · $${discounted}`}
            </button>
            <p className="pt-1 text-center text-[10px] text-slate-500">
              Demo trigger: 3s. Production trigger: ~30s idle after cart abandonment.
            </p>
          </div>
        </aside>
      )}
    </div>
  );
}
