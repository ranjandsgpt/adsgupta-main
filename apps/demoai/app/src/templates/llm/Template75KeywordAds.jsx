import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bot, ExternalLink, Sparkles, X } from 'lucide-react';
import { getPreviewOverlayRoot } from '../primitives/FramePortal';
import { emitTelemetry } from '../telemetry';

const KEYWORDS = ['contextual targeting', 'creative intelligence', 'privacy-first'];
const PROMPTS = ['Summarize this', 'Why is it relevant?', 'Compare solutions'];

export default function Template75KeywordAds() {
  const [keyword, setKeyword] = useState(null);
  const [answer, setAnswer] = useState('This topic is strongly related to the article context and reader intent.');

  useEffect(() => {
    emitTelemetry('impression', { templateId: 'keyword-ads' });
  }, []);

  const openKeyword = (value) => {
    setKeyword(value);
    setAnswer(`“${value}” is a high-intent concept detected in this article. Here is a concise AI explanation and a relevant sponsored recommendation.`);
    emitTelemetry('expand', { templateId: 'keyword-ads', keyword: value });
  };

  const closePopup = (reason = 'button') => {
    setKeyword(null);
    emitTelemetry('close', { templateId: 'keyword-ads', reason });
  };

  useEffect(() => {
    if (!keyword) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setKeyword(null);
        emitTelemetry('close', { templateId: 'keyword-ads', reason: 'escape' });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [keyword]);

  const popupTarget = typeof document === 'undefined' ? null : getPreviewOverlayRoot();

  const popup = keyword ? (
    <div className="pointer-events-auto absolute inset-0 z-[90] flex items-center justify-center p-3">
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-slate-950/70 backdrop-blur-sm"
        onClick={() => closePopup('backdrop')}
        aria-label="Dismiss keyword ad"
      />
      <div className="custom-scrollbar relative max-h-[94%] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white text-slate-900 shadow-2xl" role="dialog" aria-modal="true" aria-label={`Keyword intelligence for ${keyword}`}>
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
          <div className="flex items-center gap-2 text-sm font-black"><Bot size={18} className="text-violet-600" /> Keyword intelligence</div>
          <button
            type="button"
            onClick={() => closePopup('button')}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-slate-100"
            aria-label="Close keyword ad"
          >
            <X size={18} />
          </button>
        </header>
        <div className="keyword-popup-content gap-4 p-4">
          <div>
            <span className="rounded-full bg-violet-100 px-2 py-1 text-[10px] font-bold text-violet-700">{keyword}</span>
            <h3 className="mt-3 flex items-center gap-2 text-lg font-black"><Sparkles size={18} className="text-violet-600" /> AI summary</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{answer}</p>
            <div className="mt-4 space-y-2">
              {PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => {
                    setAnswer(`${prompt}: ${keyword} helps the ad system match an appropriate format without interrupting the reading experience.`);
                    emitTelemetry('click', { templateId: 'keyword-ads', prompt });
                  }}
                  className="min-h-11 w-full rounded-xl border border-slate-200 px-3 text-left text-xs font-bold hover:border-violet-400 hover:bg-violet-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
          <aside className="mx-auto flex h-[250px] w-full max-w-[300px] flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br from-blue-700 via-violet-700 to-slate-950 p-5 text-white shadow-xl">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-200">Sponsored · 300 × 250</p>
              <h4 className="mt-3 text-2xl font-black leading-tight">Context that converts.</h4>
              <p className="mt-2 text-xs leading-5 text-blue-100">Activate privacy-safe keyword intelligence across every page.</p>
            </div>
            <button type="button" onClick={() => emitTelemetry('click', { templateId: 'keyword-ads', target: '300x250' })} className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 text-xs font-black text-slate-950">
              Explore solution <ExternalLink size={14} />
            </button>
          </aside>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <section className="relative my-7 rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-blue-600">Keyword ad demo</p>
      <p className="text-sm leading-7 text-slate-700">
        Modern publishers can combine{' '}
        <button type="button" onClick={() => openKeyword(KEYWORDS[0])} className="min-h-11 rounded px-1 font-bold text-blue-700 underline decoration-blue-400 decoration-2 underline-offset-4">{KEYWORDS[0]}</button>
        {' '}with{' '}
        <button type="button" onClick={() => openKeyword(KEYWORDS[1])} className="min-h-11 rounded px-1 font-bold text-violet-700 underline decoration-violet-400 decoration-2 underline-offset-4">{KEYWORDS[1]}</button>
        {' '}while preserving a{' '}
        <button type="button" onClick={() => openKeyword(KEYWORDS[2])} className="min-h-11 rounded px-1 font-bold text-emerald-700 underline decoration-emerald-400 decoration-2 underline-offset-4">{KEYWORDS[2]}</button>
        {' '}experience. Select a highlighted phrase to open its contextual widget.
      </p>

      {popup && (popupTarget ? createPortal(popup, popupTarget) : popup)}
    </section>
  );
}
