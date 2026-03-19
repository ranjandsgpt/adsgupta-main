import { NextRequest, NextResponse } from 'next/server';
import { generateCpmBuckets } from '@/utils/cpmBuckets';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cpmMin, cpmMax, granularity, bidderCode, lineItemBaseName } = body;
    const cpmMinN = Number(cpmMin);
    const cpmMaxN = Number(cpmMax);
    const gran = Number(granularity);
    if (Number.isNaN(cpmMinN) || Number.isNaN(cpmMaxN) || Number.isNaN(gran) || gran <= 0) {
      return NextResponse.json({ error: 'Invalid cpmMin, cpmMax, or granularity' }, { status: 400 });
    }
    const buckets = generateCpmBuckets(
      cpmMinN,
      cpmMaxN,
      gran,
      bidderCode || 'bidder',
      lineItemBaseName || 'prebid_line'
    );
    return NextResponse.json({ buckets, count: buckets.length });
  } catch {
    return NextResponse.json({ error: 'Preview failed' }, { status: 500 });
  }
}
