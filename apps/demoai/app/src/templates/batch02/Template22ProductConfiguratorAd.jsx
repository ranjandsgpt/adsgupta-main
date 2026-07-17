import React, { useCallback, useMemo, useState } from 'react';
import { Backpack, Check } from 'lucide-react';
import { useDismissState } from '../hooks/useDismissState';
import { useViewability } from '../hooks/useViewability';
import { emitTelemetry } from '../telemetry';
import { NativeWidgetChrome } from '../primitives/NativeWidgetChrome';
import { MorphContainer } from '../primitives/MorphContainer';

const TEMPLATE_ID = 'configurator';

const COLORS = [
  { id: 'ember', name: 'Ember', swatch: 'bg-orange-500', body: 'from-orange-400 to-red-600' },
  { id: 'moss', name: 'Moss', swatch: 'bg-emerald-600', body: 'from-emerald-500 to-teal-800' },
  { id: 'slate', name: 'Slate', swatch: 'bg-slate-500', body: 'from-slate-400 to-slate-700' },
  { id: 'cobalt', name: 'Cobalt', swatch: 'bg-blue-600', body: 'from-blue-400 to-indigo-700' },
];

const SIZES = [
  { id: '18l', name: '18L Daypack', price: 89 },
  { id: '28l', name: '28L Commuter', price: 119 },
  { id: '40l', name: '40L Trekker', price: 159 },
];

const ADDONS = [
  { id: 'rain', name: 'Rain cover', price: 15 },
  { id: 'laptop', name: 'Laptop sleeve', price: 22 },
  { id: 'mono', name: 'Monogram', price: 9 },
];

export default function Template22ProductConfiguratorAd() {
  const viewabilityRef = useViewability({ templateId: TEMPLATE_ID });
  const handleDismiss = useCallback((reason) => {
    emitTelemetry('close', { templateId: TEMPLATE_ID, reason });
  }, []);
  const { dismissed, dismiss } = useDismissState({ key: TEMPLATE_ID, onDismiss: handleDismiss });

  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(SIZES[1]);
  const [addons, setAddons] = useState([]);
  const [added, setAdded] = useState(false);

  const total = useMemo(
    () => size.price + addons.reduce((sum, id) => sum + ADDONS.find((a) => a.id === id).price, 0),
    [size, addons],
  );

  const toggleAddon = (id) => {
    setAdded(false);
    setAddons((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    emitTelemetry('click', { templateId: TEMPLATE_ID, target: `addon-${id}` });
  };

  const addToCart = () => {
    setAdded(true);
    emitTelemetry('click', { templateId: TEMPLATE_ID, target: 'add-to-cart', color: color.id, size: size.id, addons, total });
    emitTelemetry('complete', { templateId: TEMPLATE_ID, action: 'configured', total });
  };

  if (dismissed) return null;

  return (
    <div ref={viewabilityRef} className="mx-auto w-full max-w-md">
      <NativeWidgetChrome label="Sponsored · Trailhead Co." title="Build your pack" onClose={() => dismiss('button')}>
        <MorphContainer className={`relative flex h-44 items-center justify-center bg-gradient-to-br ${color.body}`} duration={400}>
          <Backpack className="text-white drop-shadow-lg" size={84} strokeWidth={1.4} />
          <span className="absolute bottom-2 right-3 rounded-full bg-black/35 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
            {color.name} · {size.name}
          </span>
        </MorphContainer>

        <div className="space-y-4 p-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Color</p>
            <div className="flex gap-2">
              {COLORS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => { setColor(option); setAdded(false); emitTelemetry('click', { templateId: TEMPLATE_ID, target: `color-${option.id}` }); }}
                  aria-label={`Color ${option.name}`}
                  aria-pressed={color.id === option.id}
                  className={`flex h-11 w-11 items-center justify-center rounded-full ${option.swatch} ${
                    color.id === option.id ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
                  }`}
                >
                  {color.id === option.id && <Check className="text-white" size={18} />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Size</p>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => { setSize(option); setAdded(false); emitTelemetry('click', { templateId: TEMPLATE_ID, target: `size-${option.id}` }); }}
                  aria-pressed={size.id === option.id}
                  className={`min-h-11 rounded-full border px-4 text-sm font-semibold ${
                    size.id === option.id
                      ? 'border-cyan-400 bg-cyan-400/10 text-cyan-300'
                      : 'border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {option.name} · ${option.price}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Add-ons</p>
            <div className="flex flex-wrap gap-2">
              {ADDONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggleAddon(option.id)}
                  aria-pressed={addons.includes(option.id)}
                  className={`flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold ${
                    addons.includes(option.id)
                      ? 'border-emerald-400 bg-emerald-400/10 text-emerald-300'
                      : 'border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {addons.includes(option.id) && <Check size={15} />}
                  {option.name} +${option.price}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={addToCart}
            className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-xl font-bold transition-colors ${
              added ? 'bg-emerald-400 text-slate-950' : 'bg-white text-slate-950 hover:bg-cyan-100'
            }`}
          >
            {added ? <><Check size={20} /> Added · ${total}</> : `Add to cart · $${total}`}
          </button>
        </div>
      </NativeWidgetChrome>
    </div>
  );
}
