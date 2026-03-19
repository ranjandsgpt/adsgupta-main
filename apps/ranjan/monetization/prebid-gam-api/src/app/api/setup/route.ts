import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { GamClientStub, GamSoapClient } from '@/lib/gam/client';
import { runPrebidGamSetup } from '@/services/setupEngine';

const ConfigSchema = z.object({
  advertiserName: z.string().min(1),
  advertiserId: z.string().optional(),
  orderName: z.string().min(1),
  lineItemBaseName: z.string().min(1),
  creativeNameBase: z.string().min(1),
  bidderCode: z.string().min(1),
  kvpKeyName: z.string().min(1),
  hbAdidKey: z.string().min(1),
  hbFormatKey: z.string().min(1),
  hbPbGranularity: z.number().positive(),
  cpmMin: z.number().min(0),
  cpmMax: z.number().min(0),
  adSizes: z.array(z.string()),
  currency: z.string().length(3),
  lineItemPriority: z.number().int().min(1),
  timezone: z.string(),
  targetingType: z.enum(['PRICE_PRIORITY', 'STANDARD']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { networkCode, dryRun } = body;
    if (!networkCode || typeof networkCode !== 'string') {
      return NextResponse.json({ error: 'networkCode required' }, { status: 400 });
    }
    const config = ConfigSchema.parse(body.config);
    if (config.cpmMax < config.cpmMin) {
      return NextResponse.json({ error: 'cpmMax must be >= cpmMin' }, { status: 400 });
    }

    const conn = await prisma.gamConnection.findUnique({ where: { networkCode } });
    if (!conn) {
      return NextResponse.json({ error: 'GAM not connected for this network code' }, { status: 401 });
    }
    const now = new Date();
    if (conn.expiresAt <= now && conn.refreshToken) {
      // Optional: refresh token here
    }
    const creds = {
      networkCode: conn.networkCode,
      accessToken: conn.accessToken,
      refreshToken: conn.refreshToken,
      expiresAt: conn.expiresAt,
    };

    const client = dryRun ? new GamClientStub() : new GamSoapClient();
    const result = await runPrebidGamSetup(client, creds, config, !!dryRun);

    await prisma.executionLog.create({
      data: {
        networkCode,
        bidderCode: config.bidderCode,
        dryRun: !!dryRun,
        success: result.success,
        advertiserId: result.advertiserId ?? null,
        orderId: result.orderId ?? null,
        lineItemIds: result.lineItemIds,
        creativeIds: result.creativeIds,
        message: result.message ?? null,
        configSnapshot: config as object,
      },
    });

    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: e.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Setup failed' }, { status: 500 });
  }
}
