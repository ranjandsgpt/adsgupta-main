import React, { useCallback, useMemo, useState } from 'react';
import { Calculator, ShieldCheck } from 'lucide-react';
import { useDismissState } from '../hooks/useDismissState';
import { useViewability } from '../hooks/useViewability';
import { emitTelemetry } from '../telemetry';
import { NativeWidgetChrome } from '../primitives/NativeWidgetChrome';

const TEMPLATE_ID = 'quote-estimator';

const COVERAGE = [
  { id: 'basic', name: 'Basic', multiplier: 1 },
  { id: 'standard', name: 'Standard', multiplier: 1.35 },
  { id: 'premium', name: 'Premium', multiplier: 1.8 },
];

const HOME_TYPES = [
  { id: 'apartment', name: 'Apartment', base: 14 },
  { id: 'townhouse', name: 'Townhouse', base: 21 },
  { id: 'detached', name: 'Detached', base: 29 },
];

export default function Template27QuoteEstimatorAd() {
  const viewabilityRef = useViewability({ templateId: TEMPLATE_ID });
  const handleDismiss = useCallback((reason) => {
    emitTelemetry('close', { templateId: TEMPLATE_ID, reason });
  }, []);
  const { dismissed, dismiss } = useDismissState({ key: TEMPLATE_ID, onDismiss: handleDismiss });

  const [homeType, setHomeType] = useState(HOME_TYPES[0]);
  const [coverage, setCoverage] = useState(COVERAGE[1]);
  const [valuables, setValuables] = useState(20);
  const [requested, setRequested] = useState(false);

  // Local demo formula — a real unit would call the insurer's rating engine.
  const monthly = useMemo(
    () => Math.round((homeType.base + valuables * 0.22) * coverage.multiplier),
    [homeType, coverage, valuables],
  );

  const requestQuote = () => {
    setRequested(true);
    emitTelemetry('click', { templateId: TEMPLATE_ID, target: 'request-quote', homeType: homeType.id, coverage: coverage.id, valuables, monthly });
    emitTelemetry('complete', { templateId: TEMPLATE_ID, action: 'quote-requested', monthly });
  };

  if (dismissed) return null;

  return (
    <div ref={viewabilityRef} className="mx-auto w-full max-w-md">
      <NativeWidgetChrome label="Sponsored · Harbor Insurance" title="60-second home quote" onClose={() => dismiss('button')}>
        <div className="space-y-4 p-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Home type</p>
            <div className="flex flex-wrap gap-2">
              {HOME_TYPES.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={homeType.id === option.id}
                  onClick={() => { setHomeType(option); setRequested(false); emitTelemetry('click', { templateId: TEMPLATE_ID, target: `home-${option.id}` }); }}
                  className={`min-h-11 rounded-full border px-4 text-sm font-semibold ${
                    homeType.id === option.id
                      ? 'border-cyan-400 bg-cyan-400/10 text-cyan-300'
                      : 'border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Coverage level</p>
            <div className="flex flex-wrap gap-2">
              {COVERAGE.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={coverage.id === option.id}
                  onClick={() => { setCoverage(option); setRequested(false); emitTelemetry('click', { templateId: TEMPLATE_ID, target: `coverage-${option.id}` }); }}
                  className={`min-h-11 rounded-full border px-4 text-sm font-semibold ${
                    coverage.id === option.id
                      ? 'border-cyan-400 bg-cyan-400/10 text-cyan-300'
                      : 'border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="quote-valuables" className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
              Valuables to cover
              <span className="text-sm font-black normal-case tracking-normal text-white">${valuables}k</span>
            </label>
            <input
              id="quote-valuables"
              type="range"
              min={5}
              max={100}
              step={5}
              value={valuables}
              onChange={(event) => { setValuables(Number(event.target.value)); setRequested(false); }}
              onPointerUp={() => emitTelemetry('click', { templateId: TEMPLATE_ID, target: 'valuables-slider', valuables })}
              className="h-11 w-full cursor-pointer accent-cyan-400"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-slate-300">
              <Calculator className="text-cyan-400" size={20} />
              <p className="text-sm font-semibold">Estimated premium</p>
            </div>
            <p className="text-2xl font-black text-white" aria-live="polite">
              ${monthly}<span className="text-sm font-semibold text-slate-400">/mo</span>
            </p>
          </div>

          <button
            type="button"
            onClick={requestQuote}
            className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-xl font-bold transition-colors ${
              requested ? 'bg-emerald-400 text-slate-950' : 'bg-white text-slate-950 hover:bg-cyan-100'
            }`}
          >
            <ShieldCheck size={19} />
            {requested ? 'Quote saved — agent will follow up (demo)' : 'Lock in this quote'}
          </button>
          <p className="text-center text-[10px] text-slate-500">
            Estimate computed locally for demo purposes; not a binding offer.
          </p>
        </div>
      </NativeWidgetChrome>
    </div>
  );
}
