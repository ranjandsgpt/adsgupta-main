import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check, ChevronDown, Laptop, List, Moon, Palette, Smartphone, Sparkles, Sun, X, Zap,
} from 'lucide-react';
import { articleContent } from './CreativeTemplateAdFormats';
import { CREATIVE_TEMPLATES, getCreativeTemplate } from '../templates';
import { emitTelemetry } from '../templates/telemetry';

function TemplateRenderer({ template, scrollAreaRef, instanceKey }) {
  if (!template) return null;
  const Component = template.component;
  const isOverlay = template.placement === 'overlay';
  return (
    <div className={isOverlay ? 'creative-template-overlay-slot animate-fade-in' : 'creative-template-slot animate-fade-in-up'}>
      <Suspense
        key={instanceKey}
        fallback={<div className="my-6 flex min-h-40 items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-500">Loading template…</div>}
      >
        <Component scrollAreaRef={scrollAreaRef} />
      </Suspense>
    </div>
  );
}

/* Auto Ads placement plan: each format unlocks when the reader crosses a scroll depth OR a dwell time. */
const AUTO_TRIGGERS = {
  desktop: [
    { id: 'ai-summary', scroll: 0, seconds: 0, label: 'Page load' },
    { id: 'prompt-inline-ads', scroll: 10, seconds: 4, label: 'Engaged reader' },
    { id: 'sponsored-answer', scroll: 25, seconds: 9, label: 'Mid-article' },
    { id: 'side-rail', scroll: 45, seconds: 16, label: 'Deep scroll' },
    { id: 'sticky-top', scroll: 65, seconds: 24, label: 'Article end' },
  ],
  mobile: [
    { id: 'ai-summary', scroll: 0, seconds: 0, label: 'Page load' },
    { id: 'prompt-inline-ads', scroll: 10, seconds: 4, label: 'Engaged reader' },
    { id: 'sponsored-answer', scroll: 25, seconds: 9, label: 'Mid-article' },
    { id: 'sticky-footer', scroll: 45, seconds: 16, label: 'Deep scroll' },
    { id: 'prompt-popup', scroll: 70, seconds: 26, label: 'Article end' },
  ],
};

const CATEGORY_ORDER = [
  'AI & intent-driven',
  'Overlay formats',
  'Commerce formats',
  'Interactive & rewarded',
  'Native & widgets',
  'Video, motion & immersive',
  'Dynamic & utility',
  'Other in-page formats',
];

function categoryFor(format) {
  const family = format.family.toLowerCase();
  const id = format.id.toLowerCase();
  if (/llm|ai|conversational/.test(family) || /ai-|prompt|keyword|agentic|chat/.test(id)) return 'AI & intent-driven';
  if (format.placement === 'overlay') return 'Overlay formats';
  if (/commerce|shopping|checkout|product/.test(`${family} ${id}`)) return 'Commerce formats';
  if (/interactive|rewarded|playable|game|quiz|gesture|scratch/.test(`${family} ${id}`)) return 'Interactive & rewarded';
  if (/native|widget|sponsorship|lead/.test(family)) return 'Native & widgets';
  if (/video|motion|story|immersive|audio|ar|morph/.test(`${family} ${id}`)) return 'Video, motion & immersive';
  if (/dynamic|location|research|experimental|cross-device/.test(family)) return 'Dynamic & utility';
  return 'Other in-page formats';
}

const FORMAT_GROUPS = CATEGORY_ORDER.map((name) => ({
  name,
  formats: CREATIVE_TEMPLATES.filter((format) => categoryFor(format) === name),
})).filter((group) => group.formats.length);

function buildAdPlan(ids, count) {
  const formats = ids.map(getCreativeTemplate).filter(Boolean);
  if (!formats.length) return [];
  const plan = formats.slice(0, count);
  const repeatable = formats.filter((format) => format.placement === 'inline');
  for (let index = 0; plan.length < count && repeatable.length; index += 1) {
    plan.push(repeatable[index % repeatable.length]);
  }
  return plan;
}

export function CreativeTemplateLab() {
  const [selectedFormats, setSelectedFormats] = useState(['ai-summary']);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [device, setDevice] = useState('desktop');
  const [theme, setTheme] = useState('light');
  const [adCount, setAdCount] = useState(3);
  const [autoAds, setAutoAds] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [peakScroll, setPeakScroll] = useState(0);
  const [readerSeconds, setReaderSeconds] = useState(0);
  const [openGroups, setOpenGroups] = useState(['AI & intent-driven']);
  const scrollAreaRef = useRef(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!autoAds) return undefined;
    setReaderSeconds(0);
    setPeakScroll(0);
    const timer = window.setInterval(() => setReaderSeconds((seconds) => Math.min(seconds + 0.5, 99)), 500);
    return () => window.clearInterval(timer);
  }, [autoAds, device]);

  useEffect(() => {
    const area = scrollAreaRef.current;
    if (!area) return undefined;
    let frame;
    const update = () => {
      frame = null;
      const available = area.scrollHeight - area.clientHeight;
      const progress = available > 0 ? Math.round((area.scrollTop / available) * 100) : 0;
      setScrollProgress(progress);
      setPeakScroll((peak) => Math.max(peak, progress));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    area.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      area.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [device]);

  const autoTriggers = AUTO_TRIGGERS[device];
  const autoFormatIds = useMemo(
    () => autoTriggers.filter((t) => peakScroll >= t.scroll || readerSeconds >= t.seconds).map((t) => t.id),
    [autoTriggers, peakScroll, readerSeconds],
  );

  const activeIds = autoAds ? autoFormatIds : selectedFormats;
  const adPlan = useMemo(
    () => (autoAds ? autoFormatIds.slice(0, adCount).map(getCreativeTemplate).filter(Boolean) : buildAdPlan(activeIds, adCount)),
    [activeIds, adCount, autoAds, autoFormatIds],
  );
  const inlineAds = adPlan.filter((format) => format.placement === 'inline');
  const overlayAds = adPlan.filter((format) => format.placement === 'overlay');
  const previewCopy = (index, sentences = 2) => (
    device === 'mobile' ? articleContent[index].split('. ').slice(0, sentences).join('. ') : articleContent[index]
  );

  const toggleFormat = (id) => {
    setAutoAds(false);
    setSelectedFormats((current) => (
      current.includes(id)
        ? (current.length === 1 ? current : current.filter((item) => item !== id))
        : [...current, id]
    ));
    emitTelemetry('click', { target: 'format-selector', templateId: id });
  };

  const formatList = (
    <div className={`overflow-hidden rounded-xl border ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
      {FORMAT_GROUPS.map((group) => {
        const open = openGroups.includes(group.name);
        const selectedCount = group.formats.filter((format) => selectedFormats.includes(format.id)).length;
        return (
          <section key={group.name} className={`border-b last:border-b-0 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <button
              type="button"
              onClick={() => setOpenGroups((current) => (
                current.includes(group.name) ? current.filter((name) => name !== group.name) : [...current, group.name]
              ))}
              className={`flex min-h-14 w-full items-center justify-between gap-3 px-4 text-left ${open ? (isDark ? 'bg-slate-800/80' : 'bg-slate-100') : isDark ? 'bg-slate-900' : 'bg-white'}`}
              aria-expanded={open}
            >
              <span>
                <span className={`block text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{group.name}</span>
                <span className="mt-0.5 block text-[10px] text-slate-500">{selectedCount}/{group.formats.length} selected</span>
              </span>
              <ChevronDown size={18} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
              <div className={`p-2 ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
                <button
                  type="button"
                  onClick={() => {
                    setAutoAds(false);
                    const ids = group.formats.map((format) => format.id);
                    setSelectedFormats((current) => (
                      ids.every((id) => current.includes(id))
                        ? current.filter((id) => !ids.includes(id))
                        : [...new Set([...current, ...ids])]
                    ));
                  }}
                  className="mb-1 min-h-11 w-full rounded-lg px-3 text-right text-xs font-bold text-blue-600 hover:bg-blue-500/10"
                >
                  {selectedCount === group.formats.length ? 'Clear group' : 'Select all'}
                </button>
                {group.formats.map((format) => {
                  const selected = selectedFormats.includes(format.id);
                  return (
                    <label key={format.id} className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 ${selected ? 'bg-cyan-500/10' : isDark ? 'hover:bg-slate-900' : 'hover:bg-slate-50'}`}>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleFormat(format.id)}
                        className="h-5 w-5 shrink-0 accent-cyan-500"
                      />
                      <span className="min-w-0 flex-1">
                        <span className={`block text-sm font-semibold ${selected ? 'text-cyan-500' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>{format.displayName}</span>
                        <span className="block text-[9px] uppercase tracking-wider text-slate-500">{format.family} · {format.size}</span>
                      </span>
                      {selected && <Check size={14} className="shrink-0 text-cyan-500" />}
                    </label>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );

  return (
    <div className={`flex min-h-[760px] flex-1 flex-col overflow-hidden transition-colors ${isDark ? 'bg-slate-950 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className={`hidden w-80 shrink-0 flex-col border-r shadow-xl lg:flex ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'}`}>
          <div className={`border-b p-5 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <h1 className={`mb-2 flex items-center gap-2 text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
              <Palette size={20} className="text-cyan-500" /> Creative <span className="text-cyan-500">Template</span>
            </h1>
            <p className="text-xs text-slate-500">Combine formats and preview them together in context.</p>
            <div className={`mt-4 rounded-xl border p-3 ${autoAds ? 'border-violet-400/50 bg-violet-500/10' : isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
              <p className={`flex items-center gap-2 text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {autoAds && <Sparkles size={15} className="text-violet-500" />}
                {autoAds ? 'Auto plan active' : `${selectedFormats.length} format${selectedFormats.length === 1 ? '' : 's'} selected`}
              </p>
              <p className="mt-1 text-xs text-slate-500">{adPlan.length} live placement{adPlan.length === 1 ? '' : 's'} in this view.</p>
            </div>
          </div>
          <div className="custom-scrollbar min-h-0 flex-grow overflow-y-auto p-3">
            <div className="mb-2 ml-2 text-xs font-bold tracking-wider text-slate-500">TEMPLATE LIST · {CREATIVE_TEMPLATES.length}</div>
            {formatList}
          </div>
        </aside>

        <main className={`relative flex min-h-0 min-w-0 flex-grow flex-col ${isDark ? 'bg-slate-900' : 'bg-[#eef2fa]'}`}>
          <div className={`shrink-0 border-b px-3 py-2 lg:hidden ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'}`}>
            <button type="button" onClick={() => setPickerOpen(true)} className={`flex min-h-11 w-full items-center justify-between rounded-lg border px-3 text-sm ${isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-900'}`}>
              <span className="flex items-center gap-2"><List size={16} className="text-cyan-500" />{autoAds ? 'Auto Ads plan' : `${selectedFormats.length} formats selected`}</span>
              <ChevronDown size={16} />
            </button>
          </div>

          {pickerOpen && (
            <>
              <button type="button" aria-label="Close format picker" className="fixed inset-0 z-[60] bg-black/70 lg:hidden" onClick={() => setPickerOpen(false)} />
              <div className={`safe-bottom fixed inset-x-0 bottom-0 z-[70] flex max-h-[75vh] flex-col rounded-t-2xl border-t shadow-2xl lg:hidden ${isDark ? 'border-slate-700 bg-slate-950' : 'border-slate-200 bg-white'}`}>
                <div className={`flex items-center justify-between border-b p-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                  <h2 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>Combine ad formats</h2>
                  <button type="button" onClick={() => setPickerOpen(false)} className="flex min-h-11 min-w-11 items-center justify-center" aria-label="Done"><X size={20} /></button>
                </div>
                <div className="custom-scrollbar flex-1 overflow-y-auto p-3">{formatList}</div>
              </div>
            </>
          )}

          <div className={`flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-3 py-2.5 sm:px-5 ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'}`}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="hidden text-[10px] font-bold uppercase tracking-widest text-slate-500 sm:inline">Preview</span>
              <div className={`flex rounded-xl p-1 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                {[['desktop', Laptop, 'Desktop'], ['mobile', Smartphone, 'Mobile']].map(([value, Icon, label]) => (
                  <button key={value} type="button" onClick={() => setDevice(value)} className={`flex min-h-11 items-center gap-2 rounded-lg px-3 text-xs font-bold ${device === value ? 'bg-blue-600 text-white shadow' : 'text-slate-500'}`}><Icon size={15} />{label}</button>
                ))}
              </div>
              <div className={`flex rounded-xl p-1 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                {[['light', Sun, 'Light'], ['dark', Moon, 'Dark']].map(([value, Icon, label]) => (
                  <button key={value} type="button" onClick={() => setTheme(value)} className={`flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-xs font-bold ${theme === value ? (isDark ? 'bg-slate-600 text-white' : 'bg-white text-slate-900 shadow') : 'text-slate-500'}`}><Icon size={14} /><span className="hidden sm:inline">{label}</span></button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 text-xs font-bold ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                Ads
                <select value={adCount} onChange={(event) => setAdCount(Number(event.target.value))} className={`bg-transparent text-sm outline-none ${isDark ? 'text-white' : 'text-slate-900'}`} aria-label="Number of ads">
                  {[1, 2, 3, 4, 5].map((count) => <option key={count} value={count}>{count}</option>)}
                </select>
              </label>
              <button
                type="button"
                role="switch"
                aria-checked={autoAds}
                onClick={() => {
                  setAutoAds((value) => !value);
                  emitTelemetry('click', { target: 'auto-ads', enabled: !autoAds });
                }}
                className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 text-xs font-black transition-colors duration-300 ${autoAds ? 'border-violet-400 bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg' : isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}
              >
                <Sparkles size={15} className={autoAds ? 'animate-pulse' : ''} /> Auto Ads
                <span className={`relative inline-block h-5 w-9 shrink-0 rounded-full transition-colors duration-300 ${autoAds ? 'bg-white/30' : 'bg-slate-300'}`}>
                  <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-300 ease-out ${autoAds ? 'translate-x-4' : 'translate-x-0'}`} />
                </span>
              </button>
            </div>
          </div>

          <div className="relative flex min-h-0 flex-1 items-start justify-center overflow-auto p-3 sm:p-6">
            {autoAds && (
              <div className={`animate-slide-up fixed bottom-24 left-3 z-[58] hidden w-64 rounded-2xl border p-4 shadow-2xl xl:block ${isDark ? 'border-violet-400/30 bg-slate-950 text-white' : 'border-violet-200 bg-white text-slate-900'}`}>
                <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-violet-500"><Zap size={14} /> Dynamic trigger monitor</p>
                <div className="mt-3 space-y-3 text-[10px] font-bold uppercase tracking-wider">
                  <div><div className="mb-1 flex justify-between"><span>Scroll depth</span><span>{scrollProgress}%</span></div><div className="h-1.5 overflow-hidden rounded bg-slate-300/30"><div className="h-full bg-blue-500 transition-[width] duration-300 ease-out" style={{ width: `${scrollProgress}%` }} /></div></div>
                  <div><div className="mb-1 flex justify-between"><span>Reader time</span><span>{readerSeconds.toFixed(1)}s</span></div><div className="h-1.5 overflow-hidden rounded bg-slate-300/30"><div className="h-full bg-violet-500 transition-[width] duration-500 ease-linear" style={{ width: `${Math.min((readerSeconds / 30) * 100, 100)}%` }} /></div></div>
                  <ul className="space-y-1.5 border-t border-slate-500/20 pt-2 normal-case tracking-normal">
                    {autoTriggers.map((trigger) => {
                      const unlocked = autoFormatIds.includes(trigger.id);
                      const live = adPlan.some((format) => format.id === trigger.id);
                      const meta = getCreativeTemplate(trigger.id);
                      return (
                        <li key={trigger.id} className={`flex items-center gap-2 transition-opacity duration-300 ${unlocked ? 'opacity-100' : 'opacity-40'}`}>
                          <span className={`h-2 w-2 shrink-0 rounded-full transition-colors duration-300 ${live ? 'animate-pulse bg-emerald-500' : unlocked ? 'bg-amber-400' : 'bg-slate-400'}`} />
                          <span className="min-w-0 flex-1 truncate font-semibold">{meta?.displayName || trigger.id}</span>
                          <span className="shrink-0 text-[9px] text-slate-500">{trigger.label}</span>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="grid grid-cols-2 gap-2"><div className="rounded-lg bg-slate-500/10 p-2">Device<span className="mt-1 block text-xs capitalize">{device}</span></div><div className="rounded-lg bg-slate-500/10 p-2">Live ads<span className="mt-1 block text-xs">{adPlan.length}</span></div></div>
                </div>
              </div>
            )}

            <div
              className={`creative-preview-frame relative flex h-[690px] max-h-full w-full flex-col overflow-hidden bg-white shadow-2xl transition-all duration-300 ${device === 'mobile' ? 'border-slate-800' : 'max-w-6xl rounded-xl border border-slate-300'}`}
              style={device === 'mobile'
                ? { maxWidth: 390, borderWidth: 10, borderRadius: 40, transform: 'translateZ(0)' }
                : { transform: 'translateZ(0)' }}
            >
              <div className={`flex h-10 shrink-0 items-center gap-3 border-b px-4 ${device === 'mobile' ? 'justify-center' : ''} ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                {device === 'mobile' ? <div className="h-5 w-28 rounded-full bg-slate-800" /> : (
                  <><div className="flex gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /></div><span className={`min-w-0 flex-1 truncate rounded-md px-3 py-1 text-center text-[10px] ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>publisher.example / future-of-advertising</span></>
                )}
              </div>

              <div id="creative-preview-overlay-root" className="pointer-events-none absolute inset-x-0 bottom-0 top-10 z-50 overflow-hidden">
                {overlayAds.map((format, index) => <TemplateRenderer key={`${format.id}-overlay-${index}`} template={format} scrollAreaRef={scrollAreaRef} instanceKey={`${format.id}-overlay-${index}`} />)}
              </div>

              <div ref={scrollAreaRef} id="demo-scroll-area" className={`custom-scrollbar relative min-h-0 flex-grow overflow-y-auto overflow-x-hidden ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
                <article className={`relative z-10 mx-auto max-w-3xl px-4 py-8 sm:px-8 sm:py-12 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <div className={`mb-8 flex items-center justify-between border-b pb-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                    <div className="flex items-center gap-2"><span className="h-5 w-5 rounded bg-blue-600" /><span className={`font-black ${isDark ? 'text-white' : 'text-slate-950'}`}>Signal Daily</span></div>
                    <button type="button" className="min-h-11 rounded-lg bg-blue-600 px-4 text-xs font-bold text-white">Subscribe</button>
                  </div>
                  <span className="mb-4 block font-mono text-xs tracking-widest text-cyan-600">INDUSTRY INSIGHTS</span>
                  <h1 className={`creative-article-title mb-6 text-2xl font-bold leading-tight sm:text-4xl ${isDark ? 'text-white' : 'text-slate-950'}`}>How Programmatic Creative Is Shaping the Future of Digital Advertising</h1>
                  <div className={`mb-8 flex items-center gap-4 border-b pb-6 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                    <div className={`h-10 w-10 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} /><div><div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Ranjan Dasgupta</div><div className="text-xs text-slate-500">Published Oct 24 • 5 min read</div></div>
                  </div>
                  <div className="space-y-6 text-sm leading-7 sm:text-base">
                    <p>{previewCopy(0)}</p>
                    {inlineAds.length > 0 && (
                      <div className={`creative-inline-grid grid items-start gap-4 ${device === 'desktop' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {inlineAds.map((format, index) => (
                          <TemplateRenderer key={`${format.id}-inline-${index}`} template={format} scrollAreaRef={scrollAreaRef} instanceKey={`${format.id}-inline-${index}`} />
                        ))}
                      </div>
                    )}
                    <p>{previewCopy(1)}</p>
                    <h2 className={`pt-5 text-xl font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>The Role of Context</h2>
                    <p>{previewCopy(2)}</p>
                    {device === 'mobile' && <p>{previewCopy(3, 1)}</p>}
                    <div className={`my-8 rounded-xl border p-5 text-center italic ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>&ldquo;{device === 'mobile' ? 'Every format runs inside this responsive preview.' : articleContent[5]}&rdquo;</div>
                    <div className="flex h-28 items-center justify-center border-t border-slate-300/30 text-xs text-slate-500">End of article · Auto Ads uses scroll depth as a placement signal.</div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
