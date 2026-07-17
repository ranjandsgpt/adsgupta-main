import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Bot, Check, ShoppingBag } from 'lucide-react';
import { useDismissState } from '../hooks/useDismissState';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useViewability } from '../hooks/useViewability';
import { emitTelemetry } from '../telemetry';
import { NativeWidgetChrome } from '../primitives/NativeWidgetChrome';

const TEMPLATE_ID = 'chat-to-purchase';

const PRODUCTS = {
  hydration: { name: 'DewCloud Serum', price: 32, hue: 'from-sky-400 to-cyan-600' },
  glow: { name: 'Lumen Drops', price: 38, hue: 'from-amber-300 to-orange-500' },
  repair: { name: 'NightFix Balm', price: 44, hue: 'from-violet-400 to-fuchsia-600' },
};

const FLOW = {
  start: {
    bot: ['Hi! I\u2019m the Aurea concierge. What is your skin goal today?'],
    options: [
      { label: 'Hydration', next: 'recommend', pick: 'hydration' },
      { label: 'Glow', next: 'recommend', pick: 'glow' },
      { label: 'Repair', next: 'recommend', pick: 'repair' },
    ],
  },
  recommend: {
    bot: ['Great choice \u2014 this one is our best seller for that.'],
    productCard: true,
    options: [
      { label: 'Add to cart', next: 'added', telemetry: 'add-to-cart' },
      { label: 'Tell me more', next: 'details' },
    ],
  },
  details: {
    bot: [
      'It\u2019s a 30ml daily formula, fragrance-free and dermatologist tested.',
      'Want me to pop it in your cart?',
    ],
    options: [
      { label: 'Add to cart', next: 'added', telemetry: 'add-to-cart' },
      { label: 'Start over', next: 'start' },
    ],
  },
  added: {
    bot: ['Added! Ready for express checkout, or keep browsing?'],
    options: [
      { label: 'Buy now', next: 'done', telemetry: 'buy-now' },
      { label: 'Start over', next: 'start' },
    ],
  },
  done: {
    bot: ['Order confirmed \u2014 demo order #AU-2481. A receipt simulation would land in your inbox.'],
    options: [{ label: 'Shop again', next: 'start' }],
    complete: true,
  },
};

export default function Template15ChatToPurchaseAd() {
  const reducedMotion = useReducedMotion();
  const viewabilityRef = useViewability({ templateId: TEMPLATE_ID });
  const handleDismiss = useCallback((reason) => {
    emitTelemetry('close', { templateId: TEMPLATE_ID, reason });
  }, []);
  const { dismissed, dismiss } = useDismissState({ key: TEMPLATE_ID, onDismiss: handleDismiss });

  const [nodeId, setNodeId] = useState('start');
  const [pick, setPick] = useState('hydration');
  const [messages, setMessages] = useState(() => FLOW.start.bot.map((text, i) => ({ id: `b0-${i}`, from: 'bot', text })));
  const [typing, setTyping] = useState(false);
  const timerRef = useRef(null);
  const logRef = useRef(null);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, typing]);

  const chooseOption = (option) => {
    emitTelemetry('click', { templateId: TEMPLATE_ID, target: option.telemetry ?? `option-${option.label}` });
    const nextPick = option.pick ?? pick;
    if (option.pick) setPick(option.pick);
    const nextNode = FLOW[option.next];
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, from: 'user', text: option.label }]);
    setTyping(true);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        ...nextNode.bot.map((text, i) => ({ id: `b-${Date.now()}-${i}`, from: 'bot', text })),
        ...(nextNode.productCard ? [{ id: `p-${Date.now()}`, from: 'bot', product: nextPick }] : []),
      ]);
      setNodeId(option.next);
      if (nextNode.complete) {
        emitTelemetry('complete', { templateId: TEMPLATE_ID, action: 'purchase', product: PRODUCTS[nextPick].name });
      }
    }, reducedMotion ? 80 : 700);
  };

  if (dismissed) return null;
  const node = FLOW[nodeId];

  return (
    <div ref={viewabilityRef} className="mx-auto w-full max-w-md">
      <NativeWidgetChrome label="Sponsored · Aurea Skincare" title="Concierge chat" onClose={() => dismiss('button')}>
        <div ref={logRef} className="h-72 space-y-3 overflow-y-auto overscroll-contain p-4" aria-live="polite">
          {messages.map((message) => (
            message.product ? (
              <div key={message.id} className="max-w-[85%] overflow-hidden rounded-2xl border border-white/10 bg-slate-800">
                <div className={`flex h-20 items-center justify-center bg-gradient-to-br ${PRODUCTS[message.product].hue}`}>
                  <ShoppingBag className="text-white/90" size={30} />
                </div>
                <div className="flex items-center justify-between gap-2 px-3 py-2">
                  <p className="text-sm font-semibold text-white">{PRODUCTS[message.product].name}</p>
                  <p className="text-sm font-bold text-cyan-300">${PRODUCTS[message.product].price}</p>
                </div>
              </div>
            ) : (
              <div key={message.id} className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    message.from === 'user' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-200'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            )
          ))}
          {typing && (
            <div className="flex items-center gap-2 text-slate-500">
              <Bot size={16} />
              <span className={`text-xs ${reducedMotion ? '' : 'animate-pulse'}`}>Concierge is typing&hellip;</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 border-t border-white/10 p-3">
          {node.options.map((option) => (
            <button
              key={option.label}
              type="button"
              disabled={typing}
              onClick={() => chooseOption(option)}
              className="flex min-h-11 items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 text-sm font-semibold text-cyan-200 transition-colors hover:bg-cyan-400/20 disabled:opacity-50"
            >
              {option.telemetry === 'buy-now' && <Check size={16} />}
              {option.label}
            </button>
          ))}
        </div>
      </NativeWidgetChrome>
    </div>
  );
}
