import type { CpmBucket } from '@/types';

export function generateCpmBuckets(
  cpmMin: number,
  cpmMax: number,
  granularity: number,
  bidderCode: string,
  lineItemBaseName: string
): CpmBucket[] {
  const buckets: CpmBucket[] = [];
  const eps = 0.0001;
  for (let p = cpmMin; p <= cpmMax + eps; p = round(p + granularity)) {
    const price = round(p);
    const name = `${lineItemBaseName}_${formatPrice(price)}`;
    buckets.push({ price, lineItemName: name });
  }
  return buckets;
}

function round(x: number): number {
  return Math.round(x * 100) / 100;
}

function formatPrice(p: number): string {
  return p.toFixed(2).replace('.', '_');
}
