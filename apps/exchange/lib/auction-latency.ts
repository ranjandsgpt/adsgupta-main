/** Ring buffer of recent OpenRTB auction handler durations (ms), in-process only. */
const buf: number[] = [];
const MAX = 400;

export function recordAuctionLatencyMs(ms: number) {
  if (!Number.isFinite(ms) || ms < 0) return;
  buf.push(ms);
  if (buf.length > MAX) buf.shift();
}

export function getAuctionLatencyStats(): { avgMs: number; p95Ms: number; samples: number; histogram: number[] } {
  if (buf.length === 0) {
    return { avgMs: 0, p95Ms: 0, samples: 0, histogram: new Array(12).fill(0) };
  }
  const sorted = [...buf].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  const avgMs = sum / sorted.length;
  const p95Ms = sorted[Math.floor(sorted.length * 0.95)] ?? sorted[sorted.length - 1];
  const buckets = [10, 25, 50, 75, 100, 150, 200, 300, 500, 750, 1000, 1500];
  const histogram = new Array(buckets.length + 1).fill(0);
  for (const x of buf) {
    let i = buckets.findIndex((b) => x <= b);
    if (i < 0) i = buckets.length;
    histogram[i] += 1;
  }
  return { avgMs, p95Ms, samples: buf.length, histogram };
}
