import React, { useEffect, useRef, useState } from 'react';
import { Camera, Rotate3D } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { MorphContainer } from '../primitives/MorphContainer';
import { Batch05Shell, buttonClass, trackClick } from './Batch05Shell';

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

  const startCamera = async () => {
    trackClick(ID, 'camera-request');
    if (!navigator.mediaDevices?.getUserMedia) {
      setMode('fallback');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
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

  return (
    <Batch05Shell templateId={ID} title="MREC to AR Morph" className="mx-auto max-w-md" onClosed={closeMedia}>
      <MorphContainer className="bg-gradient-to-br from-emerald-950 to-slate-950 p-5 text-white">
        <div className="relative flex min-h-[250px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/30">
          <video ref={videoRef} playsInline muted className={`absolute inset-0 h-full w-full object-cover ${mode === 'camera' ? 'block' : 'hidden'}`} aria-label="Camera preview" />
          <div className="relative z-10 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-emerald-300 text-5xl shadow-2xl" style={{ transform: `rotateY(${rotation}deg)`, transition: reducedMotion ? 'none' : 'transform 250ms ease' }}>⌁</div>
            <p className="mt-4 text-sm text-white/75">{mode === 'camera' ? 'Camera active · AR marker preview' : '360° product fallback is ready'}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {mode !== 'camera' ? (
            <button type="button" className={`${buttonClass} flex items-center justify-center gap-2 bg-emerald-300 text-slate-950`} onClick={startCamera}><Camera size={18} /> Try camera</button>
          ) : (
            <button type="button" className={`${buttonClass} bg-white/10 text-white`} onClick={stopCamera}>Stop camera</button>
          )}
          <button type="button" className={`${buttonClass} flex items-center justify-center gap-2 bg-white/10 text-white`} onClick={() => { setMode(mode === 'camera' ? 'camera' : 'fallback'); setRotation((value) => value + 90); trackClick(ID, 'rotate-360'); }}><Rotate3D size={18} /> Rotate 360°</button>
        </div>
      </MorphContainer>
    </Batch05Shell>
  );
}
