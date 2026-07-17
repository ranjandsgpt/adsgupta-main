import React, { useCallback, useEffect, useState } from 'react';
import { Contrast, Monitor, Moon, Sun } from 'lucide-react';
import { useDismissState } from '../hooks/useDismissState';
import { useViewability } from '../hooks/useViewability';
import { emitTelemetry } from '../telemetry';
import { MorphContainer } from '../primitives/MorphContainer';

const TEMPLATE_ID = 'adaptive-theme';

const THEMES = {
  light: {
    label: 'Light',
    icon: Sun,
    shell: 'border-slate-200 bg-white',
    art: 'from-cyan-100 via-sky-200 to-indigo-200',
    artInk: 'text-indigo-600',
    heading: 'text-slate-900',
    body: 'text-slate-600',
    badge: 'bg-slate-100 text-slate-600',
    cta: 'bg-slate-900 text-white hover:bg-slate-700',
  },
  dark: {
    label: 'Dark',
    icon: Moon,
    shell: 'border-white/10 bg-slate-900',
    art: 'from-indigo-950 via-slate-900 to-cyan-950',
    artInk: 'text-cyan-300',
    heading: 'text-white',
    body: 'text-slate-400',
    badge: 'bg-white/10 text-slate-300',
    cta: 'bg-cyan-400 text-slate-950 hover:bg-cyan-300',
  },
  contrast: {
    label: 'High contrast',
    icon: Contrast,
    shell: 'border-4 border-yellow-300 bg-black',
    art: 'from-black via-black to-black',
    artInk: 'text-yellow-300',
    heading: 'text-yellow-300',
    body: 'text-white',
    badge: 'bg-yellow-300 text-black',
    cta: 'bg-yellow-300 text-black hover:bg-yellow-200',
  },
};

export default function Template18AdaptiveThemeAd() {
  const viewabilityRef = useViewability({ templateId: TEMPLATE_ID });
  const handleDismiss = useCallback((reason) => {
    emitTelemetry('close', { templateId: TEMPLATE_ID, reason });
  }, []);
  const { dismissed, dismiss } = useDismissState({ key: TEMPLATE_ID, onDismiss: handleDismiss });

  const [mode, setMode] = useState('auto');
  const [systemDark, setSystemDark] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
  );
  const [systemContrast, setSystemContrast] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-contrast: more)').matches,
  );

  useEffect(() => {
    const darkMedia = window.matchMedia('(prefers-color-scheme: dark)');
    const contrastMedia = window.matchMedia('(prefers-contrast: more)');
    const updateDark = () => setSystemDark(darkMedia.matches);
    const updateContrast = () => setSystemContrast(contrastMedia.matches);
    darkMedia.addEventListener('change', updateDark);
    contrastMedia.addEventListener('change', updateContrast);
    return () => {
      darkMedia.removeEventListener('change', updateDark);
      contrastMedia.removeEventListener('change', updateContrast);
    };
  }, []);

  const resolved = mode === 'auto'
    ? (systemContrast ? 'contrast' : systemDark ? 'dark' : 'light')
    : mode;
  const theme = THEMES[resolved];

  const pickMode = (next) => {
    setMode(next);
    emitTelemetry('click', { templateId: TEMPLATE_ID, target: `theme-${next}` });
  };

  if (dismissed) return null;

  return (
    <section ref={viewabilityRef} className="mx-auto w-full max-w-md" aria-label="Adaptive theme sponsored unit">
      <MorphContainer className={`overflow-hidden rounded-2xl border shadow-2xl ${theme.shell}`} duration={400}>
        <div className="flex items-center justify-between gap-3 px-4 pt-3">
          <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${theme.badge}`}>
            Sponsored · matches your theme
          </span>
          <button
            type="button"
            onClick={() => dismiss('button')}
            className={`flex min-h-11 min-w-11 items-center justify-center rounded-full ${theme.body} hover:opacity-70`}
            aria-label="Close ad"
          >
            ✕
          </button>
        </div>
        <div className={`mx-4 mt-3 flex h-32 items-center justify-center rounded-xl bg-gradient-to-br ${theme.art}`}>
          <Monitor className={theme.artInk} size={44} />
          <span className={`ml-3 text-2xl font-black ${theme.artInk}`}>Nook Display 5K</span>
        </div>
        <div className="p-4">
          <h2 className={`text-xl font-black ${theme.heading}`}>One screen, every mood.</h2>
          <p className={`mt-1.5 text-sm leading-relaxed ${theme.body}`}>
            The creative re-skins itself to the reader&rsquo;s color scheme and contrast preference, so the brand
            never clashes with the page. Currently rendering the {theme.label.toLowerCase()} variant.
          </p>
          <button
            type="button"
            onClick={() => {
              emitTelemetry('click', { templateId: TEMPLATE_ID, target: 'cta', theme: resolved });
              emitTelemetry('complete', { templateId: TEMPLATE_ID, action: 'cta-clicked', theme: resolved });
            }}
            className={`mt-4 min-h-11 w-full rounded-xl px-5 text-sm font-bold transition-colors ${theme.cta}`}
          >
            See it in your setup
          </button>
        </div>
        <div className={`flex items-center gap-1.5 border-t p-2 ${resolved === 'light' ? 'border-slate-200' : 'border-white/10'}`} role="tablist" aria-label="Theme override">
          {['auto', 'light', 'dark', 'contrast'].map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={mode === option}
              onClick={() => pickMode(option)}
              className={`min-h-11 flex-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                mode === option
                  ? `${theme.badge}`
                  : `${theme.body} hover:opacity-70`
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </MorphContainer>
    </section>
  );
}
