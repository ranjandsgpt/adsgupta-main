import React, { useEffect, useState } from 'react';
import { Sparkles, ExternalLink, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { emitTelemetry } from '../telemetry';

const SUMMARY = 'Context-aware creative improves relevance by matching format, message, and timing to the reader\u2019s intent.';
const EXTENDED = ' The strongest systems reserve predictable slots first, then introduce adaptive formats only after clear engagement signals.';

export default function Template71AISummaryAd() {
  const [expanded, setExpanded] = useState(false);
  const reducedMotion = useReducedMotion();
  const [charCount, setCharCount] = useState(() => (reducedMotion ? SUMMARY.length : 0));
  const streaming = charCount < SUMMARY.length;

  useEffect(() => {
    emitTelemetry('impression', { templateId: 'ai-summary' });
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setCharCount(SUMMARY.length);
      return undefined;
    }
    if (!streaming) return undefined;
    const timer = window.setInterval(() => {
      setCharCount((count) => Math.min(count + 3, SUMMARY.length));
    }, 40);
    return () => window.clearInterval(timer);
  }, [reducedMotion, streaming]);

  return (
    <section className="my-7 overflow-hidden rounded-2xl border border-violet-300/40 bg-white text-slate-900 shadow-xl">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-gradient-to-r from-violet-50 to-cyan-50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-bold">
          <Sparkles size={17} className="text-violet-600" />
          AI summary
        </div>
        <span className="rounded-full bg-violet-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-700">Sponsored insight</span>
      </div>
      <div className="p-4 sm:p-5">
        <p className="text-sm leading-6 text-slate-700" aria-live="polite">
          {SUMMARY.slice(0, charCount)}
          {streaming && <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse rounded-sm bg-violet-500 align-middle" aria-hidden="true" />}
          {!streaming && expanded && EXTENDED}
        </p>
        <div className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-700">Relevant recommendation</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">Build responsive ad experiences with Adobe GenStudio</p>
          <button
            type="button"
            onClick={() => emitTelemetry('click', { templateId: 'ai-summary', target: 'sponsor' })}
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-xs font-bold text-white"
          >
            Explore platform <ExternalLink size={14} />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              emitTelemetry(expanded ? 'close' : 'expand', { templateId: 'ai-summary', target: 'deeper-summary' });
              setExpanded((value) => !value);
            }}
            className="min-h-11 text-xs font-semibold text-violet-700"
          >
            {expanded ? 'Show less' : 'Read deeper summary'}
          </button>
          <div className="flex gap-1 text-slate-400">
            <button type="button" onClick={() => emitTelemetry('click', { templateId: 'ai-summary', target: 'feedback-up' })} className="flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-slate-100" aria-label="Helpful"><ThumbsUp size={15} /></button>
            <button type="button" onClick={() => emitTelemetry('click', { templateId: 'ai-summary', target: 'feedback-down' })} className="flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-slate-100" aria-label="Not helpful"><ThumbsDown size={15} /></button>
          </div>
        </div>
      </div>
    </section>
  );
}
