const listeners = new Set();
const history = [];
const MAX_HISTORY = 100;

export const TELEMETRY_EVENTS = Object.freeze([
  'impression',
  'viewable',
  'click',
  'expand',
  'close',
  'complete',
]);

export function emitTelemetry(type, detail = {}) {
  if (!TELEMETRY_EVENTS.includes(type)) return null;

  const event = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    timestamp: new Date().toISOString(),
    ...detail,
  };

  history.unshift(event);
  history.splice(MAX_HISTORY);
  listeners.forEach((listener) => listener(event));

  if (import.meta.env.DEV) {
    console.info('[Creative telemetry]', event);
  }

  return event;
}

export function subscribeTelemetry(listener, { replay = false } = {}) {
  listeners.add(listener);
  if (replay) history.slice().reverse().forEach(listener);
  return () => listeners.delete(listener);
}

export function getTelemetryHistory() {
  return history.slice();
}
