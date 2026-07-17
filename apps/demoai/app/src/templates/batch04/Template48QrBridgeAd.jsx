import React, { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { ExternalLink, ScanLine, Smartphone } from 'lucide-react';
import { useDismissState } from '../hooks/useDismissState';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { NativeWidgetChrome } from '../primitives/NativeWidgetChrome';
import { emitTelemetry } from '../telemetry';

const ID = 'qr-bridge-ad';
const HANDOFF_URL = 'https://demoai.adsgupta.com/creatives?handoff=summer-preview';
const DEEP_LINK = 'demoai://bridge/summer-preview';
const MOBILE_QUERY = '(pointer: coarse) and (max-width: 767px)';

function useIsMobile() {
  const [mobile, setMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches,
  );
  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return mobile;
}

export default function Template48QrBridgeAd() {
  const [attempted, setAttempted] = useState(false);
  const [scanState, setScanState] = useState('idle'); // idle | scanning | scanned
  const scanTimer = useRef(null);
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();

  // Standards-compliant QR module matrix generated locally — no CDN or image service.
  const qr = useMemo(() => QRCode.create(HANDOFF_URL, { errorCorrectionLevel: 'M' }), []);
  const moduleCount = qr.modules.size;
  const modulePath = useMemo(() => {
    const { size, data } = qr.modules;
    let d = '';
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        if (data[y * size + x]) d += `M${x} ${y}h1v1h-1z`;
      }
    }
    return d;
  }, [qr]);

  const { dismissed, dismiss } = useDismissState({ key: ID, onDismiss: (reason) => emitTelemetry('close', { templateId: ID, reason }) });

  useEffect(() => () => window.clearTimeout(scanTimer.current), []);

  if (dismissed) return null;

  const openDeepLink = () => {
    setAttempted(true);
    emitTelemetry('click', { templateId: ID, target: 'deep-link' });
    window.location.assign(DEEP_LINK);
  };

  const simulateScan = () => {
    if (scanState === 'scanning') return;
    emitTelemetry('click', { templateId: ID, target: 'simulate-scan' });
    if (reduced) {
      setScanState('scanned');
      emitTelemetry('complete', { templateId: ID, target: 'simulate-scan' });
      return;
    }
    setScanState('scanning');
    scanTimer.current = window.setTimeout(() => {
      setScanState('scanned');
      emitTelemetry('complete', { templateId: ID, target: 'simulate-scan' });
    }, 1800);
  };

  return (
    <NativeWidgetChrome label="Sponsored · cross-device demo" title="Continue this preview on your phone" onClose={() => dismiss('button')}>
      <style>{'@keyframes qr-bridge-scan{0%{top:0}50%{top:calc(100% - 4px)}100%{top:0}}'}</style>
      <div className={`grid gap-5 p-4 ${isMobile ? '' : 'sm:grid-cols-[auto_1fr] sm:items-center'}`}>
        {!isMobile && (
          <figure className="mx-auto">
            <div className="relative h-48 w-48 overflow-hidden rounded-lg bg-white p-2">
              <svg
                role="img"
                aria-label={`QR code linking to ${HANDOFF_URL}`}
                viewBox={`0 0 ${moduleCount} ${moduleCount}`}
                className="h-full w-full"
                shapeRendering="crispEdges"
              >
                <path d={modulePath} fill="#020617" />
              </svg>
              {scanState === 'scanning' && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 h-1 bg-cyan-400/90 shadow-[0_0_12px_2px_rgba(34,211,238,0.8)]"
                  style={{ animation: 'qr-bridge-scan 1.8s ease-in-out' }}
                />
              )}
            </div>
            <figcaption className="mt-2 text-center text-xs text-slate-400">Scan with your phone camera to open the handoff link</figcaption>
          </figure>
        )}
        <div>
          <Smartphone className="text-cyan-300" />
          <h3 className="mt-2 text-xl font-black text-white">Bridge the experience</h3>
          {isMobile ? (
            <>
              <p className="mt-2 text-sm text-slate-400">You are on a phone already — jump straight into the app. Nothing opens until you tap.</p>
              <button type="button" onClick={openDeepLink} className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 font-bold text-slate-950">Open in app <ExternalLink size={18} /></button>
              {attempted && <p role="status" className="mt-2 text-xs text-slate-300">Deep-link attempt requested after your tap. Availability depends on this device.</p>}
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-slate-400">Scan the code with your phone, or preview how a scan hands the session off.</p>
              <button type="button" onClick={simulateScan} disabled={scanState === 'scanning'} className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 font-bold text-slate-950 disabled:opacity-70">
                <ScanLine size={18} /> {scanState === 'scanning' ? 'Scanning…' : 'Simulate phone scan'}
              </button>
              <p role="status" className="mt-2 min-h-4 text-xs text-slate-300">
                {scanState === 'scanning' && 'Scanning the QR code…'}
                {scanState === 'scanned' && `Scan recognized · handoff link delivered: ${HANDOFF_URL}`}
              </p>
            </>
          )}
        </div>
      </div>
    </NativeWidgetChrome>
  );
}
