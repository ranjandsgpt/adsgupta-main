import React, { useEffect, useRef, useState } from 'react';
import { Camera, Rotate3D } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { MorphContainer } from '../primitives/MorphContainer';
import { Batch05Shell, MorphOverlay, buttonClass, trackClick, useEscapeAction } from './Batch05Shell';

const ID = 'mrec-ar-morph';

export default function Template60MrecArMorph() {
  const [mode, setMode] = useState('preview');
  const [rotation, setRotation] = useState(0);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const reducedMotion = useReducedMotion();

  const releaseCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };
  useEffect(() => releaseCamera, []);

  // The video element only exists while the overlay is mounted, so the stream
  // is attached after the camera mode renders.
  useEffect(() => {
    if (mode !== 'camera') return;
    const video = videoRef.current;
    if (!video || !streamRef.current) return;
    video.srcObject = streamRef.current;
    video.play().catch(() => {});
  }, [mode]);

  const startCamera = async () => {
    trackClick(ID, 'camera-request');
    if (!navigator.mediaDevices?.getUserMedia) {
      setMode('fallback');
      return;
    }
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      setMode('camera');
    } catch {
      setMode('fallback');
    }
  };

  const stopCamera = () => {
    releaseCamera();
    setMode('fallback');
    trackClick(ID, 'camera-stop');
  };
  const closeMedia = () => {
    releaseCamera();
    setMode('fallback');
  };
  useEscapeAction(stopCamera, mode === 'camera');

  const rotate = () => {
    setRotation((value) => value + 90);
    trackClick(ID, 'rotate-360');
  };
  const marker = (sizeClass) => (
    <div
      className={`mx-auto flex items-center justify-center rounded-[2rem] bg-emerald-300 shadow-2xl ${sizeClass}`}
      style={{ transform: `rotateY(${rotation}deg)`, transition: reducedMotion ? 'none' : 'transform 250ms ease' }}
    >
      ⌁
    </div>
  );

  return (
    <>
      <Batch05Shell templateId={ID} title="MREC to AR Morph" className="mx-auto max-w-md" onClosed={closeMedia}>
        <MorphContainer className="bg-gradient-to-br from-emerald-950 to-slate-950 p-5 text-white">
          <div className="relative flex min-h-[180px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/30">
            <div className="relative z-10 text-center">
              {marker('h-20 w-20 text-4xl')}
              <p className="mt-4 text-sm text-white/75">{mode === 'camera' ? 'Camera active in the AR view' : '360° product fallback is ready'}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {mode !== 'camera' ? (
              <button type="button" className={`${buttonClass} flex items-center justify-center gap-2 bg-emerald-300 text-slate-950`} onClick={startCamera}><Camera size={18} /> Try camera</button>
            ) : (
              <button type="button" className={`${buttonClass} bg-white/10 text-white`} onClick={stopCamera}>Stop camera</button>
            )}
            <button type="button" className={`${buttonClass} flex items-center justify-center gap-2 bg-white/10 text-white`} onClick={rotate}><Rotate3D size={18} /> Rotate 360°</button>
          </div>
        </MorphContainer>
      </Batch05Shell>

      {mode === 'camera' && (
        <MorphOverlay label="AR camera preview" onClose={stopCamera} className="bg-slate-950 text-white">
          <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full object-cover" aria-label="Camera preview" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" aria-hidden="true" />
          <div className="relative z-10 flex h-full flex-col items-center justify-between p-6 pt-16">
            <p className="text-xs font-bold uppercase tracking-[.22em] text-emerald-300">Sponsored · AR marker preview</p>
            {marker('h-24 w-24 text-5xl')}
            <div className="flex w-full max-w-sm gap-2">
              <button type="button" className={`${buttonClass} flex flex-1 items-center justify-center gap-2 bg-emerald-300 text-slate-950`} onClick={rotate}><Rotate3D size={18} /> Rotate 360°</button>
              <button type="button" className={`${buttonClass} bg-white/15 text-white`} onClick={stopCamera}>Stop camera</button>
            </div>
          </div>
        </MorphOverlay>
      )}
    </>
  );
}
