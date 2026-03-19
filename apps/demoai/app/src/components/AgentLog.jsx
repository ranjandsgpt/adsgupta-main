import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const INITIAL_LINES = [
  { time: '09:41:02', agent: 'BuilderBot', msg: "Generated 'Ad-Campaign Optimizer'." },
  { time: '09:41:03', agent: 'FinanceBot', msg: 'Detected User Intent: Enterprise-level.' },
  { time: '09:41:03', agent: 'FinanceBot', msg: 'Initiating AP2 Protocol negotiation...' },
  { time: '09:41:04', agent: 'UserAgent', msg: 'Confirmed $0.05 micro-stream for session.' },
  { time: '09:41:05', agent: 'AdBot', msg: "Injected 'Shopify Plus' contextual referral link (Estimated CPC: $4.50)." },
];

const STREAM_LINES = [
  { time: '09:41:06', agent: 'BuilderBot', msg: 'Rendering premium layout (Vibe-Check: High-Value).' },
  { time: '09:41:07', agent: 'SponsorBot', msg: 'Bid accepted: Nike Volt Green palette ($0.05).' },
  { time: '09:41:08', agent: 'ComputeBot', msg: 'GPU cost: $0.02 — Ad-cover option presented.' },
  { time: '09:41:09', agent: 'FinanceBot', msg: 'Web Monetization stream active: 0.001¢/min.' },
  { time: '09:41:10', agent: 'AdBot', msg: 'Contextual placement: Fitness → Sports brand match.' },
];

export function AgentLog() {
  const [lines, setLines] = useState(INITIAL_LINES);
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef(null);
  const streamTimeoutRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  useEffect(() => {
    if (isStreaming) return;
    const t = setTimeout(() => setIsStreaming(true), 2000);
    return () => clearTimeout(t);
  }, [isStreaming]);

  useEffect(() => {
    if (!isStreaming) return;

    let index = 0;
    const addNext = () => {
      if (index >= STREAM_LINES.length) return;
      setLines((prev) => [...prev, STREAM_LINES[index]]);
      index += 1;
      if (index >= STREAM_LINES.length) return;
      const delay = 1500 + Math.random() * 1000;
      streamTimeoutRef.current = setTimeout(addNext, delay);
    };

    streamTimeoutRef.current = setTimeout(addNext, 800);

    return () => {
      if (streamTimeoutRef.current != null) {
        clearTimeout(streamTimeoutRef.current);
        streamTimeoutRef.current = null;
      }
    };
  }, [isStreaming]);

  return (
    <div className="h-full flex flex-col rounded-xl border border-white/10 bg-black/60 backdrop-blur-sm overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/10 flex items-center gap-2 bg-white/5">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-cyan-400/90 text-xs font-mono tracking-wider">Agent-Log</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-2 min-h-0">
        <AnimatePresence initial={false}>
          {lines.map((line, i) => (
            <motion.div
              key={`${line.time}-${i}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-zinc-400 leading-relaxed"
            >
              <span className="text-zinc-500 select-none">{line.time}</span>
              {' - '}
              <span className="text-cyan-400/90">{line.agent}:</span>
              {' '}
              <span className="text-zinc-300">{line.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
