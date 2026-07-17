import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BadgePercent, Mic, MicOff } from 'lucide-react';
import BatchTemplateFrame, { track } from './BatchTemplateFrame';

const ID = 'voice-cta';
const KEYWORD_LABEL = '“Show me deals”';

// Accepts "show me deals" plus close variants: "show me the deals",
// "show deals", "show me some deals", "show me a deal", etc.
const KEYWORD_PATTERN = /\bshow\b(?:\s+\w+){0,3}?\s+deals?\b/i;

function matchesKeyword(text) {
  const normalized = text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
  return KEYWORD_PATTERN.test(normalized);
}

function getSpeechRecognition() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

const WAVE_BARS = [0.35, 0.7, 1, 0.55, 0.85, 0.45, 0.95, 0.6, 0.3];

function Waveform({ active, reducedMotion }) {
  return (
    <div className="flex h-12 items-center justify-center gap-1" aria-hidden="true">
      {WAVE_BARS.map((scale, index) => (
        <span
          key={index}
          className={`w-1.5 rounded-full transition-colors ${active ? 'bg-cyan-300' : 'bg-white/25'}`}
          style={{
            height: `${Math.round(scale * 100)}%`,
            transformOrigin: 'center',
            animation: active && !reducedMotion ? `voice-cta-wave 0.9s ease-in-out ${index * 0.09}s infinite` : 'none',
            opacity: active ? 1 : 0.6,
          }}
        />
      ))}
      <style>{'@keyframes voice-cta-wave { 0%, 100% { transform: scaleY(0.4); } 50% { transform: scaleY(1); } }'}</style>
    </div>
  );
}

export default function Template14VoiceCTAAd() {
  // status: idle | listening | matched | unsupported | denied | error
  const [status, setStatus] = useState('idle');
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const matchedRef = useRef(false);

  const supported = Boolean(getSpeechRecognition());

  const teardownRecognition = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
    try {
      recognition.abort();
    } catch {
      /* already stopped */
    }
    recognitionRef.current = null;
  }, []);

  useEffect(() => teardownRecognition, [teardownRecognition]);

  const revealOffer = useCallback((via, detail = {}) => {
    if (matchedRef.current) return;
    matchedRef.current = true;
    setStatus('matched');
    track(ID, 'complete', { intent: 'show-deals', via, ...detail });
  }, []);

  const startListening = () => {
    if (status === 'listening' || matchedRef.current) return;
    track(ID, 'click', { target: 'voice-start' });

    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setStatus('unsupported');
      track(ID, 'expand', { mode: 'fallback', reason: 'unsupported' });
      return;
    }

    teardownRecognition();
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    recognition.onresult = (event) => {
      let heard = '';
      for (let i = 0; i < event.results.length; i += 1) {
        for (let j = 0; j < event.results[i].length; j += 1) {
          heard += ` ${event.results[i][j].transcript}`;
        }
      }
      heard = heard.trim();
      setTranscript(heard);
      if (matchesKeyword(heard)) {
        teardownRecognition();
        revealOffer('voice', { transcript: heard.slice(0, 80) });
      }
    };

    recognition.onerror = (event) => {
      teardownRecognition();
      if (matchedRef.current) return;
      const denied = event.error === 'not-allowed' || event.error === 'service-not-allowed';
      setStatus(denied ? 'denied' : 'error');
      track(ID, 'expand', { mode: 'fallback', reason: event.error || 'error' });
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      if (!matchedRef.current) {
        setStatus((current) => (current === 'listening' ? 'idle' : current));
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setTranscript('');
      setStatus('listening');
      track(ID, 'expand', { mode: 'listening' });
    } catch {
      teardownRecognition();
      setStatus('error');
      track(ID, 'expand', { mode: 'fallback', reason: 'start-failed' });
    }
  };

  const stopListening = () => {
    track(ID, 'click', { target: 'voice-stop' });
    teardownRecognition();
    setStatus('idle');
  };

  const tapFallback = () => {
    track(ID, 'click', { target: 'tap-fallback' });
    revealOffer('tap-fallback');
  };

  const listening = status === 'listening';
  const fallbackNote = {
    unsupported: 'Voice input isn’t supported in this browser.',
    denied: 'Microphone access was denied.',
    error: 'Voice recognition ran into a problem.',
  }[status];

  const statusLine = (() => {
    if (status === 'matched') return 'Keyword recognized!';
    if (fallbackNote) return fallbackNote;
    if (listening) return transcript ? `Heard: “${transcript}”` : 'Listening… say the phrase above';
    return `Tap the mic, then say ${KEYWORD_LABEL}`;
  })();

  return (
    <BatchTemplateFrame templateId={ID} title="Voice CTA Ad" subtitle="Web Speech API · mic starts only on tap">
      {({ reducedMotion }) => (
        <div className="rounded-2xl bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-950 p-6 text-center">
          {status === 'matched' ? (
            <div className={reducedMotion ? '' : 'animate-[voice-cta-reveal_0.3s_ease-out]'}>
              <style>{'@keyframes voice-cta-reveal { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }'}</style>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400/20">
                <BadgePercent size={44} className="text-emerald-300" />
              </div>
              <h3 className="mt-4 text-2xl font-black">Deal unlocked</h3>
              <p className="mt-2 text-sm text-emerald-200">25% off sitewide + free shipping this weekend.</p>
              <button
                type="button"
                onClick={() => track(ID, 'click', { target: 'claim-deal' })}
                className="mt-5 min-h-11 w-full rounded-full bg-emerald-400 px-6 font-black text-slate-950"
              >
                Claim the deal
              </button>
            </div>
          ) : (
            <>
              <Waveform active={listening} reducedMotion={reducedMotion} />
              <h3 className="mt-4 text-2xl font-black">Say {KEYWORD_LABEL}</h3>
              <p className="mt-2 min-h-6 text-sm text-cyan-200" aria-live="polite">{statusLine}</p>

              {fallbackNote ? (
                <button
                  type="button"
                  onClick={tapFallback}
                  className="mt-5 min-h-11 w-full rounded-full bg-white px-6 font-black text-slate-950"
                >
                  Tap to see deals instead
                </button>
              ) : (
                <button
                  type="button"
                  onClick={listening ? stopListening : startListening}
                  className={`mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-6 font-black ${listening ? 'bg-rose-400 text-slate-950' : 'bg-white text-slate-950'}`}
                  aria-pressed={listening}
                >
                  {listening ? <MicOff size={18} /> : <Mic size={18} />}
                  {listening ? 'Stop listening' : 'Tap to speak'}
                </button>
              )}

              {!fallbackNote && (
                <button
                  type="button"
                  onClick={tapFallback}
                  className="mt-3 min-h-11 w-full rounded-full border border-white/20 px-6 text-sm font-bold text-white/80"
                >
                  Prefer to tap? Show me deals
                </button>
              )}

              <p className="mt-3 text-[10px] uppercase tracking-widest text-white/50">
                {supported ? 'On-device speech recognition · nothing is recorded by this demo' : 'Voice unavailable · tap fallback enabled'}
              </p>
            </>
          )}
        </div>
      )}
    </BatchTemplateFrame>
  );
}
