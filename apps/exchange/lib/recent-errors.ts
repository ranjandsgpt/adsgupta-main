/** In-memory error feed for admin health UI (last N messages). Not durable. */
const MAX = 20;
const ring: { ts: string; source: string; message: string }[] = [];

export function pushRecentError(source: string, message: string) {
  ring.push({ ts: new Date().toISOString(), source, message: message.slice(0, 500) });
  while (ring.length > MAX) ring.shift();
}

export function getRecentErrors() {
  return [...ring].reverse();
}
