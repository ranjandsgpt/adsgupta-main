/**
 * Simple in-memory rate limiter (per serverless instance).
 * For production-scale limits use Upstash / Vercel KV.
 */
const buckets = new Map();

export function rateLimit(key, { max = 60, windowMs = 60_000 } = {}) {
  const now = Date.now();
  const arr = buckets.get(key) || [];
  const pruned = arr.filter((t) => now - t < windowMs);
  if (pruned.length >= max) return { ok: false, retryAfterSec: Math.ceil(windowMs / 1000) };
  pruned.push(now);
  buckets.set(key, pruned);
  return { ok: true };
}

export function clientKeyFromRequest(request) {
  const h = request.headers;
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") || "unknown";
}
