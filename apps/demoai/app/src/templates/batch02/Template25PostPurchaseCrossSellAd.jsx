import React, { useCallback, useState } from 'react';
import { CheckCircle2, Package, Plus, Sparkles } from 'lucide-react';
import { useDismissState } from '../hooks/useDismissState';
import { useViewability } from '../hooks/useViewability';
import { emitTelemetry } from '../telemetry';
import { NativeWidgetChrome } from '../primitives/NativeWidgetChrome';

const TEMPLATE_ID = 'cross-sell';

const SUGGESTIONS = [
  { id: 'filters', name: 'Paper filters · 100pk', price: 8, reason: 'Pairs with your Piston Press', hue: 'from-amber-300 to-orange-500' },
  { id: 'grinder', name: 'Burr grinder mini', price: 39, reason: 'Bought together 68% of the time', hue: 'from-teal-300 to-emerald-600' },
  { id: 'scale', name: 'Brew scale 0.1g', price: 26, reason: 'Completes your pour-over kit', hue: 'from-sky-300 to-blue-600' },
];

export default function Template25PostPurchaseCrossSellAd() {
  const viewabilityRef = useViewability({ templateId: TEMPLATE_ID });
  const handleDismiss = useCallback((reason) => {
    emitTelemetry('close', { templateId: TEMPLATE_ID, reason });
  }, []);
  const { dismissed, dismiss } = useDismissState({ key: TEMPLATE_ID, onDismiss: handleDismiss });

  const [addedIds, setAddedIds] = useState([]);
  const [attached, setAttached] = useState(false);

  const toggle = (id) => {
    setAttached(false);
    setAddedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    emitTelemetry('click', { templateId: TEMPLATE_ID, target: `suggestion-${id}` });
  };

  const addedTotal = addedIds.reduce((sum, id) => sum + SUGGESTIONS.find((s) => s.id === id).price, 0);

  const attachToOrder = () => {
    setAttached(true);
    emitTelemetry('click', { templateId: TEMPLATE_ID, target: 'attach-to-order', items: addedIds, total: addedTotal });
    emitTelemetry('complete', { templateId: TEMPLATE_ID, action: 'cross-sell-attached', count: addedIds.length, total: addedTotal });
  };

  if (dismissed) return null;

  return (
    <div ref={viewabilityRef} className="mx-auto w-full max-w-md">
      <NativeWidgetChrome label="Sponsored · Terra Coffee" title="Order confirmed" onClose={() => dismiss('button')}>
        <div className="flex items-center gap-3 border-b border-white/10 bg-emerald-400/10 p-4">
          <CheckCircle2 className="shrink-0 text-emerald-400" size={26} />
          <div>
            <p className="text-sm font-bold text-white">Order #TC-9317 is confirmed (simulated)</p>
            <p className="text-xs text-slate-400">Piston Press · arrives Thursday. Add these to the same box &mdash; no extra shipping.</p>
          </div>
        </div>

        <div className="space-y-2 p-4">
          {SUGGESTIONS.map((item) => {
            const isAdded = addedIds.includes(item.id);
            return (
              <div key={item.id} className={`flex items-center gap-3 rounded-xl border p-2.5 ${isAdded ? 'border-emerald-400/50 bg-emerald-400/5' : 'border-white/10 bg-white/5'}`}>
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${item.hue}`}>
                  <Package className="text-white/90" size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{item.name}</p>
                  <p className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Sparkles size={11} className="text-cyan-400" /> {item.reason}
                  </p>
                </div>
                <p className="text-sm font-bold text-slate-300">${item.price}</p>
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  aria-pressed={isAdded}
                  aria-label={isAdded ? `Remove ${item.name}` : `Add ${item.name}`}
                  className={`flex min-h-11 min-w-11 items-center justify-center rounded-full ${
                    isAdded ? 'bg-emerald-400 text-slate-950' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {isAdded ? <CheckCircle2 size={20} /> : <Plus size={20} />}
                </button>
              </div>
            );
          })}

          <button
            type="button"
            onClick={attachToOrder}
            disabled={addedIds.length === 0}
            className={`mt-1 min-h-12 w-full rounded-xl font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              attached ? 'bg-emerald-400 text-slate-950' : 'bg-white text-slate-950 hover:bg-cyan-100'
            }`}
          >
            {attached
              ? 'Added to your order ✓'
              : addedIds.length === 0
                ? 'Select items to add'
                : `Add ${addedIds.length} item${addedIds.length > 1 ? 's' : ''} to order · $${addedTotal}`}
          </button>
        </div>
      </NativeWidgetChrome>
    </div>
  );
}
