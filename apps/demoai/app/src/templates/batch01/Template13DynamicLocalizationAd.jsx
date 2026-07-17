import React, { useState } from 'react';
import { Globe2, MapPin } from 'lucide-react';
import BatchTemplateFrame, { track } from './BatchTemplateFrame';

const ID = 'dynamic-localization';
const LOCALES = {
  'New York · English': { eyebrow: 'Tonight in New York', title: 'Dinner, delivered.', cta: 'Order now', offer: '$5 off' },
  'Madrid · Español': { eyebrow: 'Esta noche en Madrid', title: 'La cena, a tu puerta.', cta: 'Pedir ahora', offer: '5 € menos' },
  'Tokyo · 日本語': { eyebrow: '今夜の東京', title: '夕食をお届け。', cta: '今すぐ注文', offer: '¥500割引' },
};

export default function Template13DynamicLocalizationAd() {
  const [locale, setLocale] = useState(Object.keys(LOCALES)[0]);
  const content = LOCALES[locale];

  const localize = (value) => {
    setLocale(value);
    track(ID, 'click', { target: 'locale', locale: value });
    track(ID, 'complete', { simulation: 'localized', locale: value });
  };

  return (
    <BatchTemplateFrame templateId={ID} title="Dynamic Localization Ad" subtitle="Switch locale, language, offer, and CTA together">
      <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-rose-700 p-6">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/80"><MapPin size={16} /> {content.eyebrow}</div>
        <h3 className="mt-10 text-4xl font-black">{content.title}</h3>
        <div className="mt-6 flex items-center justify-between gap-3">
          <span className="rounded-full bg-amber-300 px-4 py-2 font-black text-slate-950">{content.offer}</span>
          <span className="font-bold">{content.cta} →</span>
        </div>
      </div>
      <label htmlFor={`${ID}-select`} className="mt-4 flex items-center gap-2 text-sm font-bold"><Globe2 size={18} /> Preview market</label>
      <select
        id={`${ID}-select`}
        value={locale}
        onChange={(event) => localize(event.target.value)}
        className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-slate-800 px-4 font-semibold text-white"
      >
        {Object.keys(LOCALES).map((item) => <option key={item}>{item}</option>)}
      </select>
    </BatchTemplateFrame>
  );
}
