import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Heart, Radio, ShoppingBag, Users } from 'lucide-react';
import { useDismissState } from '../hooks/useDismissState';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useViewability } from '../hooks/useViewability';
import { emitTelemetry } from '../telemetry';
import { NativeWidgetChrome } from '../primitives/NativeWidgetChrome';

const TEMPLATE_ID = 'livestream-shopping';

const CHAT_SCRIPT = [
  { user: 'mia_k', text: 'that shade is gorgeous 😍' },
  { user: 'dev.arora', text: 'does it ship to Canada?' },
  { user: 'host', text: 'Yes! Free shipping worldwide today only', host: true },
  { user: 'sofia', text: 'just grabbed two!' },
  { user: 'jjchen', text: 'how long does the battery last?' },
  { user: 'host', text: '12 hours playback — and the drop price ends when this stream does', host: true },
  { user: 'priya', text: 'ok adding to cart 🛒' },
  { user: 'marco_v', text: 'the live demo sold me' },
];

const FEATURED = [
  { id: 'gloss', name: 'Velvet Gloss Kit', price: 24, drop: 18, hue: 'from-rose-400 to-pink-600' },
  { id: 'buds', name: 'Halo Buds Mini', price: 79, drop: 59, hue: 'from-violet-400 to-indigo-600' },
];

export default function Template23LivestreamShoppingAd() {
  const reducedMotion = useReducedMotion();
  const viewabilityRef = useViewability({ templateId: TEMPLATE_ID });
  const handleDismiss = useCallback((reason) => {
    emitTelemetry('close', { templateId: TEMPLATE_ID, reason });
  }, []);
  const { dismissed, dismiss } = useDismissState({ key: TEMPLATE_ID, onDismiss: handleDismiss });

  const [chat, setChat] = useState(() => CHAT_SCRIPT.slice(0, 2));
  const [viewers, setViewers] = useState(1284);
  const [hearts, setHearts] = useState([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [addedId, setAddedId] = useState(null);
  const chatIndexRef = useRef(2);
  const chatLogRef = useRef(null);
  const heartTimersRef = useRef([]);
  const heartIdRef = useRef(0);

  useEffect(() => () => {
    heartTimersRef.current.forEach((id) => window.clearTimeout(id));
  }, []);

  useEffect(() => {
    if (dismissed) return undefined;
    const interval = window.setInterval(() => {
      setChat((prev) => {
        const next = CHAT_SCRIPT[chatIndexRef.current % CHAT_SCRIPT.length];
        chatIndexRef.current += 1;
        return [...prev.slice(-5), { ...next, key: chatIndexRef.current }];
      });
      setViewers((prev) => prev + Math.floor(Math.random() * 9) - 3);
    }, 2200);
    return () => window.clearInterval(interval);
  }, [dismissed]);

  useEffect(() => {
    if (dismissed) return undefined;
    const interval = window.setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % FEATURED.length);
    }, 8000);
    return () => window.clearInterval(interval);
  }, [dismissed]);

  useEffect(() => {
    const log = chatLogRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [chat]);

  const sendHeart = () => {
    emitTelemetry('click', { templateId: TEMPLATE_ID, target: 'heart' });
    heartIdRef.current += 1;
    const id = heartIdRef.current;
    setHearts((prev) => [...prev.slice(-8), { id, left: 12 + Math.random() * 30 }]);
    const timer = window.setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== id));
      heartTimersRef.current = heartTimersRef.current.filter((t) => t !== timer);
    }, 1600);
    heartTimersRef.current.push(timer);
  };

  const featured = FEATURED[featuredIndex];

  const buyDrop = () => {
    setAddedId(featured.id);
    emitTelemetry('click', { templateId: TEMPLATE_ID, target: 'buy-drop', product: featured.id });
    emitTelemetry('complete', { templateId: TEMPLATE_ID, action: 'drop-purchased', product: featured.id });
  };

  if (dismissed) return null;

  return (
    <div ref={viewabilityRef} className="mx-auto w-full max-w-md">
      <style>{'@keyframes live-heart { from { transform: translateY(0) scale(1); opacity: 1; } to { transform: translateY(-90px) scale(1.6); opacity: 0; } }'}</style>
      <NativeWidgetChrome label="Sponsored · GlowLive" title="Live drop · simulated stream" onClose={() => dismiss('button')}>
        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-b from-fuchsia-900 via-purple-950 to-slate-950">
          {/* procedural "host" */}
          <div className="absolute left-1/2 top-[16%] -translate-x-1/2" aria-hidden="true">
            <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-b from-amber-200 to-amber-400" />
            <div className="mx-auto -mt-2 h-28 w-40 rounded-t-[3rem] bg-gradient-to-b from-rose-500 to-rose-700" />
          </div>

          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span className={`flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-black uppercase text-white ${reducedMotion ? '' : 'animate-pulse'}`}>
              <Radio size={11} /> Live
            </span>
            <span className="flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
              <Users size={12} /> {viewers.toLocaleString()}
            </span>
          </div>

          {!reducedMotion && hearts.map((heart) => (
            <Heart
              key={heart.id}
              size={22}
              className="absolute bottom-24 fill-rose-500 text-rose-500"
              style={{ right: `${heart.left}px`, animation: 'live-heart 1.5s ease-out forwards' }}
              aria-hidden="true"
            />
          ))}

          <div ref={chatLogRef} className="absolute inset-x-3 bottom-20 max-h-36 space-y-1.5 overflow-y-auto" aria-live="polite">
            {chat.map((message, i) => (
              <p key={message.key ?? i} className="w-fit max-w-[85%] rounded-xl bg-black/45 px-2.5 py-1 text-xs text-white backdrop-blur">
                <span className={`font-bold ${message.host ? 'text-amber-300' : 'text-cyan-300'}`}>{message.user}</span>{' '}
                {message.text}
              </p>
            ))}
          </div>

          <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 rounded-2xl bg-black/55 p-2.5 backdrop-blur">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${featured.hue}`}>
              <ShoppingBag className="text-white" size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">{featured.name}</p>
              <p className="text-xs text-slate-300">
                <s className="text-slate-500">${featured.price}</s>{' '}
                <span className="font-bold text-amber-300">${featured.drop} drop price</span>
              </p>
            </div>
            <button
              type="button"
              onClick={buyDrop}
              className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-bold ${
                addedId === featured.id ? 'bg-emerald-400 text-slate-950' : 'bg-white text-slate-950 hover:bg-amber-100'
              }`}
            >
              {addedId === featured.id ? 'In cart ✓' : 'Buy'}
            </button>
            <button
              type="button"
              onClick={sendHeart}
              className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-rose-400 hover:bg-white/20"
              aria-label="Send a heart"
            >
              <Heart size={19} />
            </button>
          </div>
        </div>
      </NativeWidgetChrome>
    </div>
  );
}
