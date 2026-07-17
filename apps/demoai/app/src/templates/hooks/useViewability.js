import { useEffect, useRef } from 'react';
import { emitTelemetry } from '../telemetry';

export function useViewability({
  templateId,
  threshold = 0.5,
  viewableMs = 1000,
  metadata,
} = {}) {
  const elementRef = useRef(null);
  const impressionSent = useRef(false);
  const viewableSent = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;

    if (!impressionSent.current) {
      impressionSent.current = true;
      emitTelemetry('impression', { templateId, ...metadata });
    }

    if (typeof IntersectionObserver === 'undefined') return undefined;

    const clearViewableTimer = () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.intersectionRatio >= threshold && !viewableSent.current && !timerRef.current) {
        timerRef.current = window.setTimeout(() => {
          viewableSent.current = true;
          timerRef.current = null;
          emitTelemetry('viewable', { templateId, ...metadata });
        }, viewableMs);
      } else if (entry.intersectionRatio < threshold) {
        clearViewableTimer();
      }
    }, { threshold: [0, threshold, 1] });

    observer.observe(element);
    return () => {
      clearViewableTimer();
      observer.disconnect();
    };
  }, [metadata, templateId, threshold, viewableMs]);

  return elementRef;
}
