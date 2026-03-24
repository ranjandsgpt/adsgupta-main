/** In-process count of active admin SSE connections (auction stream). */
let activeSse = 0;

export function sseClientConnected() {
  activeSse += 1;
}

export function sseClientDisconnected() {
  activeSse = Math.max(0, activeSse - 1);
}

export function getActiveSseConnections(): number {
  return activeSse;
}
