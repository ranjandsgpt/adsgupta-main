import React, { useCallback, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Utensils } from 'lucide-react';
import { useDismissState } from '../hooks/useDismissState';
import { useViewability } from '../hooks/useViewability';
import { emitTelemetry } from '../telemetry';
import { NativeWidgetChrome } from '../primitives/NativeWidgetChrome';
import { MorphContainer } from '../primitives/MorphContainer';

const TEMPLATE_ID = 'shoppable-how-to';

const STEPS = [
  {
    title: 'Char the peppers',
    tip: 'High heat, 4 minutes a side, until blistered.',
    hue: 'from-red-400 via-orange-500 to-amber-600',
    product: { id: 'pan', name: 'Ferro carbon-steel pan', price: 75 },
  },
  {
    title: 'Blend the salsa',
    tip: 'Pulse peppers, garlic, and lime — keep it chunky.',
    hue: 'from-lime-400 via-emerald-500 to-teal-700',
    product: { id: 'blender', name: 'Volt pulse blender', price: 89 },
  },
  {
    title: 'Warm the tortillas',
    tip: '30 seconds over open flame gives the best texture.',
    hue: 'from-amber-300 via-yellow-500 to-orange-700',
    product: { id: 'tongs', name: 'Grip walnut tongs', price: 18 },
  },
  {
    title: 'Plate & serve',
    tip: 'Salsa first, then filling — tortilla stays crisp.',
    hue: 'from-fuchsia-400 via-rose-500 to-red-700',
    product: { id: 'plates', name: 'Terra stoneware set', price: 54 },
  },
];

export default function Template26ShoppableHowToAd() {
  const viewabilityRef = useViewability({ templateId: TEMPLATE_ID });
  const handleDismiss = useCallback((reason) => {
    emitTelemetry('close', { templateId: TEMPLATE_ID, reason });
  }, []);
  const { dismissed, dismiss } = useDismissState({ key: TEMPLATE_ID, onDismiss: handleDismiss });

  const [stepIndex, setStepIndex] = useState(0);
  const [cart, setCart] = useState([]);

  const goTo = (next) => {
    const clamped = Math.max(0, Math.min(STEPS.length - 1, next));
    setStepIndex(clamped);
    emitTelemetry('click', { templateId: TEMPLATE_ID, target: `step-${clamped + 1}` });
    if (clamped === STEPS.length - 1) {
      emitTelemetry('complete', { templateId: TEMPLATE_ID, action: 'how-to-finished' });
    }
  };

  const step = STEPS[stepIndex];
  const inCart = cart.includes(step.product.id);

  const addProduct = () => {
    if (inCart) return;
    setCart((prev) => [...prev, step.product.id]);
    emitTelemetry('click', { templateId: TEMPLATE_ID, target: 'add-product', product: step.product.id });
  };

  if (dismissed) return null;

  return (
    <div ref={viewabilityRef} className="mx-auto w-full max-w-md">
      <NativeWidgetChrome
        label="Sponsored · Mesa Kitchen"
        title={`Street tacos in 4 steps${cart.length ? ` · ${cart.length} in cart` : ''}`}
        onClose={() => dismiss('button')}
      >
        <MorphContainer className={`relative flex h-48 flex-col justify-end bg-gradient-to-br p-4 ${step.hue}`} duration={400}>
          <Utensils className="absolute right-4 top-4 text-white/40" size={40} aria-hidden="true" />
          <span className="w-fit rounded-full bg-black/35 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
            Step {stepIndex + 1} of {STEPS.length}
          </span>
          <h2 className="mt-2 text-2xl font-black text-white drop-shadow">{step.title}</h2>
          <p className="mt-1 max-w-xs text-sm text-white/90">{step.tip}</p>
        </MorphContainer>

        <div className="flex items-center gap-3 border-t border-white/10 p-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Used in this step</p>
            <p className="truncate text-sm font-semibold text-white">{step.product.name} · ${step.product.price}</p>
          </div>
          <button
            type="button"
            onClick={addProduct}
            aria-label={inCart ? `${step.product.name} in cart` : `Add ${step.product.name} to cart`}
            className={`flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-bold ${
              inCart ? 'bg-emerald-400 text-slate-950' : 'bg-cyan-400 text-slate-950 hover:bg-cyan-300'
            }`}
          >
            {inCart ? 'In cart ✓' : <><Plus size={16} /> Add</>}
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => goTo(stepIndex - 1)}
            disabled={stepIndex === 0}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-slate-700 text-slate-300 hover:border-slate-500 disabled:opacity-40"
            aria-label="Previous step"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-1 items-center justify-center gap-1.5" role="tablist" aria-label="Recipe steps">
            {STEPS.map((item, i) => (
              <button
                key={item.title}
                type="button"
                role="tab"
                aria-selected={i === stepIndex}
                aria-label={`Go to step ${i + 1}`}
                onClick={() => goTo(i)}
                className="flex min-h-11 min-w-11 items-center justify-center"
              >
                <span className={`h-2 rounded-full transition-all ${i === stepIndex ? 'w-6 bg-cyan-400' : 'w-2 bg-slate-600'}`} />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => goTo(stepIndex + 1)}
            disabled={stepIndex === STEPS.length - 1}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-slate-700 text-slate-300 hover:border-slate-500 disabled:opacity-40"
            aria-label="Next step"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </NativeWidgetChrome>
    </div>
  );
}
