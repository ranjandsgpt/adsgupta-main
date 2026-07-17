import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Copy, Link2, Lock, MessageCircle, Share2, Unlock } from 'lucide-react';
import { useDismissState } from '../hooks/useDismissState';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useViewability } from '../hooks/useViewability';
import { emitTelemetry } from '../telemetry';
import { NativeWidgetChrome } from '../primitives/NativeWidgetChrome';

const TEMPLATE_ID = 'share-to-unlock';
const DEMO_CODE = 'FRIENDS-25';
const SHARE_URL = 'https://demoai.adsgupta.com/creatives?ref=FRIENDS-25';
const SHARE_TEXT = 'Kudo Sneakers friends-only drop \u2014 we both get 25% off with code FRIENDS-25.';
// Local mocked referral progress; no network involved.
const REFERRALS = { joined: 2, needed: 3 };

const CHANNELS = [
  { id: 'copy', label: 'Copy link', icon: Copy },
  { id: 'message', label: 'Message', icon: MessageCircle },
  { id: 'more', label: 'More', icon: Link2 },
];

async function writeToClipboard(text) {
  if (!navigator.clipboard?.writeText) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Permission denied or otherwise unavailable — caller falls back to manual copy.
    return false;
  }
}

export default function Template29ShareToUnlockAd() {
  const reducedMotion = useReducedMotion();
  const viewabilityRef = useViewability({ templateId: TEMPLATE_ID });
  const handleDismiss = useCallback((reason) => {
    emitTelemetry('close', { templateId: TEMPLATE_ID, reason });
  }, []);
  const { dismissed, dismiss } = useDismissState({ key: TEMPLATE_ID, onDismiss: handleDismiss });

  const [stage, setStage] = useState('locked'); // locked | sharing | manual | unlocked
  const [statusMessage, setStatusMessage] = useState('');
  const [codeCopyStatus, setCodeCopyStatus] = useState('idle'); // idle | copied | failed
  const mountedRef = useRef(true);
  const codeTimerRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      window.clearTimeout(codeTimerRef.current);
    };
  }, []);

  const unlock = (channelId, method) => {
    setStage('unlocked');
    emitTelemetry('expand', { templateId: TEMPLATE_ID, surface: 'reward-revealed' });
    emitTelemetry('complete', { templateId: TEMPLATE_ID, action: 'unlocked', channel: channelId, method });
  };

  const share = async (channel) => {
    if (stage === 'sharing') return;
    setStatusMessage('');
    emitTelemetry('click', { templateId: TEMPLATE_ID, target: `share-${channel.id}` });

    // Real native share sheet (must be called synchronously off the user tap).
    if (channel.id !== 'copy' && typeof navigator.share === 'function') {
      setStage('sharing');
      try {
        await navigator.share({ title: 'Friends-only drop', text: SHARE_TEXT, url: SHARE_URL });
        if (!mountedRef.current) return;
        unlock(channel.id, 'native-share');
        return;
      } catch (error) {
        if (!mountedRef.current) return;
        if (error?.name === 'AbortError') {
          setStage('locked');
          setStatusMessage('Share cancelled \u2014 try again or copy the link instead.');
          return;
        }
        // Share sheet failed for another reason — fall through to clipboard.
      }
    }

    const copiedOk = await writeToClipboard(`${SHARE_TEXT} ${SHARE_URL}`);
    if (!mountedRef.current) return;
    if (copiedOk) {
      setStatusMessage('Link copied \u2014 paste it to a friend.');
      unlock(channel.id, 'clipboard');
    } else {
      setStage('manual');
      setStatusMessage('');
    }
  };

  const copyCode = async () => {
    emitTelemetry('click', { templateId: TEMPLATE_ID, target: 'copy-code' });
    const ok = await writeToClipboard(DEMO_CODE);
    if (!mountedRef.current) return;
    setCodeCopyStatus(ok ? 'copied' : 'failed');
    window.clearTimeout(codeTimerRef.current);
    codeTimerRef.current = window.setTimeout(() => {
      if (mountedRef.current) setCodeCopyStatus('idle');
    }, 2400);
  };

  if (dismissed) return null;

  return (
    <div ref={viewabilityRef} className="mx-auto w-full max-w-md">
      <NativeWidgetChrome label="Sponsored · Kudo Sneakers" title="Friends-only drop" onClose={() => dismiss('button')}>
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 p-5">
          {stage !== 'unlocked' ? (
            <div className="text-center">
              <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed ${stage === 'sharing' ? 'border-cyan-400 text-cyan-300' : 'border-slate-600 text-slate-400'} ${stage === 'sharing' && !reducedMotion ? 'animate-spin [animation-duration:2.5s]' : ''}`}>
                {stage === 'sharing' ? <Share2 size={30} /> : <Lock size={30} />}
              </div>
              <h2 className="mt-4 text-xl font-black text-white">
                {stage === 'sharing' ? 'Opening share sheet\u2026' : '25% off, locked behind a share'}
              </h2>
              <p className="mx-auto mt-1.5 max-w-xs text-sm text-slate-400">
                {stage === 'sharing'
                  ? 'Finish the share in your device\u2019s share sheet to unlock the code.'
                  : stage === 'manual'
                    ? 'Automatic copy isn\u2019t available here. Select the link below and copy it manually.'
                    : 'Send the drop to a friend to unlock a code for both of you.'}
              </p>

              {stage === 'locked' && (
                <>
                  <div className="mx-auto mt-4 max-w-xs" aria-label={`${REFERRALS.joined} of ${REFERRALS.needed} friends joined`}>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                      <span>Referral progress</span>
                      <span className="text-cyan-300">{REFERRALS.joined} of {REFERRALS.needed} friends joined</span>
                    </div>
                    <div className="mt-1.5 flex gap-1" aria-hidden="true">
                      {Array.from({ length: REFERRALS.needed }, (_, i) => (
                        <span key={i} className={`h-1.5 flex-1 rounded-full ${i < REFERRALS.joined ? 'bg-cyan-400' : 'bg-slate-700'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="mt-5 flex justify-center gap-2">
                    {CHANNELS.map((channel) => (
                      <button
                        key={channel.id}
                        type="button"
                        onClick={() => share(channel)}
                        className="flex min-h-11 items-center gap-2 rounded-full border border-slate-700 px-4 text-sm font-semibold text-slate-200 hover:border-cyan-400 hover:text-cyan-300"
                      >
                        <channel.icon size={16} /> {channel.label}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {stage === 'manual' && (
                <div className="mx-auto mt-5 max-w-xs">
                  <code className="block select-all break-all rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-left text-xs text-cyan-200">
                    {SHARE_URL}
                  </code>
                  <button
                    type="button"
                    onClick={() => unlock('manual', 'manual-copy')}
                    className="mt-3 min-h-11 w-full rounded-full border border-cyan-400 px-4 text-sm font-semibold text-cyan-300 hover:bg-cyan-400/10"
                  >
                    I{'\u2019'}ve copied the link
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStage('locked'); setStatusMessage(''); }}
                    className="mt-2 min-h-11 w-full rounded-full px-4 text-sm font-semibold text-slate-400 hover:text-slate-200"
                  >
                    Back
                  </button>
                </div>
              )}

              {statusMessage && (
                <p className="mt-3 text-xs font-semibold text-cyan-300" role="status">{statusMessage}</p>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                <Unlock size={30} />
              </div>
              <h2 className="mt-4 text-xl font-black text-white">Unlocked! You both get 25% off</h2>
              <p className="mx-auto mt-1.5 max-w-xs text-sm text-slate-400">
                Your friend gets the same code when they open your link. {REFERRALS.joined} of {REFERRALS.needed} friends joined so far.
              </p>
              <button
                type="button"
                onClick={copyCode}
                className="mx-auto mt-5 flex min-h-12 items-center gap-3 rounded-xl border-2 border-dashed border-emerald-400/60 bg-emerald-400/10 px-5 font-mono text-lg font-black tracking-widest text-emerald-300 hover:bg-emerald-400/20"
                aria-label={`Copy code ${DEMO_CODE}`}
              >
                <span className="select-all">{DEMO_CODE}</span> {codeCopyStatus === 'copied' ? <Check size={18} /> : <Copy size={18} />}
              </button>
              {codeCopyStatus === 'copied' && (
                <p className="mt-2 text-xs font-semibold text-emerald-400" role="status">Code copied to clipboard</p>
              )}
              {codeCopyStatus === 'failed' && (
                <p className="mt-2 text-xs font-semibold text-amber-300" role="status">
                  Copy failed {'\u2014'} select the code above and copy it manually.
                </p>
              )}
              <button
                type="button"
                onClick={() => emitTelemetry('click', { templateId: TEMPLATE_ID, target: 'shop-drop' })}
                className="mt-4 min-h-12 w-full rounded-xl bg-white font-bold text-slate-950 hover:bg-emerald-100"
              >
                Shop the drop with 25% off
              </button>
            </div>
          )}
        </div>
      </NativeWidgetChrome>
    </div>
  );
}
