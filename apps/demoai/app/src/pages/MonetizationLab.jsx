import React, { useState } from 'react';
import { ExternalLink, ArrowLeft, Upload, ShoppingBag, CreditCard, X, Info } from 'lucide-react';
import { Footer } from '../components/Footer';

// UCP = Universal Commerce Protocol (Google) only. No other definition of UCP in this project.
const PROTOCOLS = [
  {
    id: 'consent-identity',
    name: 'Consent & Identity (ucp.dev)',
    shortDesc: 'Buyer consent, privacy-safe signals. Consent layer for identity.',
    url: 'https://ucp.dev',
    theme: {
      logo: '🛡',
      accent: 'emerald',
      bg: 'from-emerald-500/10 to-slate-900',
      border: 'border-emerald-500/20',
      label: 'ucp.dev',
    },
  },
  {
    id: 'adcp',
    name: 'Ad Context Protocol',
    shortDesc: 'Open standard for agentic advertising. Media buy, creatives, signals.',
    url: 'https://adcontextprotocol.org',
    theme: {
      logo: '◈',
      accent: 'violet',
      bg: 'from-violet-500/10 to-slate-900',
      border: 'border-violet-500/20',
      label: 'adcontextprotocol.org',
    },
  },
  {
    id: 'ucp-commerce',
    name: 'UCP Commerce (Google)',
    shortDesc: 'Universal Commerce Protocol: turn AI interactions into instant sales. Direct buying in AI Mode & Gemini.',
    experience: 'ucp-commerce',
    theme: {
      logo: '🛒',
      accent: 'amber',
      bg: 'from-amber-500/10 to-slate-900',
      border: 'border-amber-500/20',
      label: 'Universal Commerce Protocol',
    },
  },
  {
    id: 'ap2',
    name: 'Agent Payments Protocol (AP2)',
    shortDesc: 'Secure tokenization and payment abstraction for agent-to-agent commerce.',
    url: 'https://developers.google.com/merchant/ucp',
    theme: {
      logo: '🔐',
      accent: 'cyan',
      bg: 'from-cyan-500/10 to-slate-900',
      border: 'border-cyan-500/20',
      label: 'Google AP2',
    },
  },
  {
    id: 'mcp',
    name: 'Model Context Protocol',
    shortDesc: 'Structured context for AI agents. Tool discovery and invocation.',
    url: 'https://modelcontextprotocol.io',
    theme: {
      logo: '⚙',
      accent: 'rose',
      bg: 'from-rose-500/10 to-slate-900',
      border: 'border-rose-500/20',
      label: 'MCP',
    },
  },
  {
    id: 'prebid',
    name: 'Prebid',
    shortDesc: 'Open-source header bidding. Unified auction for programmatic demand.',
    url: 'https://prebid.org',
    theme: {
      logo: '📊',
      accent: 'blue',
      bg: 'from-blue-500/10 to-slate-900',
      border: 'border-blue-500/20',
      label: 'prebid.org',
    },
  },
  {
    id: 'openrtb',
    name: 'OpenRTB',
    shortDesc: 'Real-time bidding spec. IAB standard for programmatic auctions.',
    url: 'https://iabtechlab.com/standards/openrtb',
    theme: {
      logo: '📡',
      accent: 'indigo',
      bg: 'from-indigo-500/10 to-slate-900',
      border: 'border-indigo-500/20',
      label: 'IAB OpenRTB',
    },
  },
  {
    id: 'seller-defined',
    name: 'Seller-Defined Audiences',
    shortDesc: 'First-party segment taxonomy. Privacy-safe audience signals.',
    url: 'https://iabtechlab.com/seller-defined-audiences',
    theme: {
      logo: '👥',
      accent: 'teal',
      bg: 'from-teal-500/10 to-slate-900',
      border: 'border-teal-500/20',
      label: 'IAB SDA',
    },
  },
  {
    id: 'tops',
    name: 'Transparent Open Pricing',
    shortDesc: 'Pricing transparency and supply-path signals.',
    url: 'https://iabtechlab.com/tops',
    theme: {
      logo: '💰',
      accent: 'orange',
      bg: 'from-orange-500/10 to-slate-900',
      border: 'border-orange-500/20',
      label: 'TOPS',
    },
  },
  {
    id: 'ads-txt',
    name: 'ads.txt',
    shortDesc: 'Authorized digital sellers. Curb domain spoofing.',
    url: 'https://iabtechlab.com/ads-txt',
    theme: {
      logo: '✓',
      accent: 'lime',
      bg: 'from-lime-500/10 to-slate-900',
      border: 'border-lime-500/20',
      label: 'ads.txt',
    },
  },
  {
    id: 'sellers-json',
    name: 'sellers.json',
    shortDesc: 'Declare direct and reseller relationships. Supply chain transparency.',
    url: 'https://iabtechlab.com/sellers-json',
    theme: {
      logo: '📋',
      accent: 'sky',
      bg: 'from-sky-500/10 to-slate-900',
      border: 'border-sky-500/20',
      label: 'sellers.json',
    },
  },
  {
    id: 'gdp',
    name: 'Google Demand Platform',
    shortDesc: 'Unified demand and bidding. Integration with UCP and AP2.',
    url: 'https://developers.google.com/authorized-buyers',
    theme: {
      logo: 'G',
      accent: 'amber',
      bg: 'from-amber-500/10 to-slate-900',
      border: 'border-amber-500/20',
      label: 'Google',
    },
  },
];

const ACCENT_CLASS = {
  emerald: 'text-emerald-400',
  violet: 'text-violet-400',
  amber: 'text-amber-400',
  cyan: 'text-cyan-400',
  rose: 'text-rose-400',
  blue: 'text-blue-400',
  indigo: 'text-indigo-400',
  teal: 'text-teal-400',
  orange: 'text-orange-400',
  lime: 'text-lime-400',
  sky: 'text-sky-400',
};

function RefactorModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Enterprise Refactor Mode — UI Stabilization</h2>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-6 text-sm text-slate-300">
          <p className="font-medium text-white">Google UCP = Universal Commerce Protocol. Apply these rules without changing business logic:</p>
          <ul className="space-y-2 list-disc list-inside">
            <li>Replace hard-coded widths (w-[420px], max-w-[85rem]) with container mx-auto, lg:grid-cols-2, lg:w-1/3, max-w-7xl.</li>
            <li>No horizontal overflow; responsive collapse at md.</li>
            <li>Remove animate-fade-in, animate-fade-in-up, pattern-grid-lg; use transition-all duration-300 ease-in-out.</li>
            <li>Timeline: single left vertical line, clean dots; no md:odd:flex-row-reverse or translate-x.</li>
            <li>Section spacing space-y-6; card padding p-6; rounded-xl/rounded-2xl; shadow-sm/shadow-lg only.</li>
            <li>Compare mode: equal-height panels; range slider consistent height, cross-browser stable.</li>
            <li>Remove unused imports, icons, state; no console warnings.</li>
          </ul>
          <p className="text-slate-500 text-xs">This modal describes the refactor. Layout in this page already uses responsive max-w-7xl and stable Tailwind utilities.</p>
        </div>
      </div>
    </div>
  );
}

function UCPCommerceExperience({ onBack }) {
  const [step, setStep] = useState(1);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [done, setDone] = useState(false);

  const canNext = step === 1 ? productName.trim() : step === 2 ? true : true;
  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else setDone(true);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#050505] text-slate-200">
      <div className="border-b border-white/5 px-4 sm:px-6 py-3 flex items-center gap-4">
        <button type="button" onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium">
          <ArrowLeft size={18} /> Back to protocols
        </button>
        <span className="text-amber-400 text-xs font-bold">Universal Commerce Protocol (UCP)</span>
      </div>
      <main className="flex-1 max-w-[900px] mx-auto w-full px-4 sm:px-6 py-8">
        {!done ? (
          <>
            <div className="flex gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`h-1 flex-1 rounded-full ${step >= s ? 'bg-amber-500' : 'bg-white/10'}`} />
              ))}
            </div>
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-white">Upload assets</h2>
                <p className="text-slate-400 text-sm">Add your product so it can be shown in AI Mode and Gemini checkout.</p>
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Product name</span>
                    <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. Wireless earbuds" className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder-slate-500 focus:border-amber-500/50 focus:outline-none" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Price (USD)</span>
                    <input type="text" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} placeholder="49.99" className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder-slate-500 focus:border-amber-500/50 focus:outline-none" />
                  </label>
                  <div className="pt-2">
                    <div className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/10 bg-black/30 py-12">
                      <Upload size={24} className="text-slate-500" />
                      <span className="text-slate-500 text-sm">Product image (optional)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-white">Preview ad in view</h2>
                <p className="text-slate-400 text-sm">How your product appears in AI Mode / Gemini native checkout.</p>
                <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-slate-900 p-6">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-xl bg-slate-700/50 flex items-center justify-center text-3xl">🛒</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-amber-400/90 uppercase tracking-wider">Sponsored • UCP Commerce</p>
                      <h3 className="text-lg font-bold text-white mt-1">{productName || 'Your product'}</h3>
                      <p className="text-amber-400 font-semibold mt-1">${productPrice || '0.00'}</p>
                      <button type="button" className="mt-3 px-4 py-2 rounded-lg bg-amber-500 text-slate-900 text-sm font-semibold">Buy in AI Mode</button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-4">Merchant of Record: you retain customer data. Checkout happens inside Gemini / AI Mode.</p>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-white">Checkout</h2>
                <p className="text-slate-400 text-sm">Complete purchase flow. Compatible with AP2, A2A, MCP.</p>
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">{productName || 'Product'}</span>
                    <span className="text-white font-semibold">${productPrice || '0.00'}</span>
                  </div>
                  <div className="h-px bg-white/10" />
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Payment (demo)</span>
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-black/50 border border-white/10">
                      <CreditCard size={18} className="text-slate-500" />
                      <span className="text-slate-400 text-sm">Payment handler: tokenization ready</span>
                    </div>
                  </label>
                  <button type="button" onClick={handleNext} className="w-full py-4 rounded-xl bg-amber-500 text-slate-900 font-bold text-sm">Complete purchase</button>
                </div>
              </div>
            )}
            <div className="mt-8 flex justify-end">
              <button type="button" onClick={handleNext} disabled={!canNext} className="px-6 py-3 rounded-xl bg-amber-500 text-slate-900 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {step < 3 ? 'Next' : 'Complete'}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={32} className="text-amber-400" />
            </div>
            <h2 className="text-xl font-black text-white mb-2">Purchase complete</h2>
            <p className="text-slate-400 text-sm mb-6">Universal Commerce Protocol: Merchant of Record retained. Checkout in AI Mode / Gemini.</p>
            <button type="button" onClick={onBack} className="px-6 py-3 rounded-xl bg-white/10 text-white font-semibold text-sm">Back to protocols</button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export function MonetizationLab() {
  const [experience, setExperience] = useState(null);
  const [refactorMode, setRefactorMode] = useState(false);

  const handleProtocolClick = (p) => {
    if (p.url) {
      window.open(p.url, '_blank', 'noopener,noreferrer');
    } else if (p.experience === 'ucp-commerce') {
      setExperience('ucp-commerce');
    }
  };

  if (experience === 'ucp-commerce') {
    return <UCPCommerceExperience onBack={() => setExperience(null)} />;
  }

  const accentColor = (p) => ACCENT_CLASS[p.theme.accent] || 'text-amber-400';

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#050505] text-slate-200">
      <main className="flex-1 container mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Sovereign <span className="text-cyan-400">Economy</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1 max-w-xl">
            Real protocols. Click to open the official site or try the{' '}
            <button
              type="button"
              onClick={() => setRefactorMode(true)}
              className="text-amber-400 font-semibold hover:text-amber-300 underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-amber-500/50 rounded"
            >
              Google UCP — Universal Commerce Protocol
            </button>
            {' '}experience in-app.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROTOCOLS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleProtocolClick(p)}
              className={`group text-left rounded-2xl border overflow-hidden transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.99] bg-gradient-to-br ${p.theme.bg} ${p.theme.border}`}
            >
              <div className="p-6">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-4 bg-black/20 ${accentColor(p)}`}>
                  {p.theme.logo}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{p.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{p.shortDesc}</p>
                <div className="flex items-center gap-2 text-xs font-semibold">
                  {p.url ? (
                    <>
                      <span className={accentColor(p)}>Open in new tab</span>
                      <ExternalLink size={14} className={accentColor(p)} />
                    </>
                  ) : (
                    <span className="text-amber-400">Try experience in-app →</span>
                  )}
                </div>
              </div>
              <div className="px-6 py-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-slate-500 uppercase tracking-wide">{p.theme.label}</span>
              </div>
            </button>
          ))}
        </div>
      </main>
      {refactorMode && <RefactorModal onClose={() => setRefactorMode(false)} />}
      <Footer />
    </div>
  );
}
