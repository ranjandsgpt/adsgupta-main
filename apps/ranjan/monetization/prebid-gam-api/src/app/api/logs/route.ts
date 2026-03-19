import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const networkCode = request.nextUrl.searchParams.get('networkCode');
  const limit = Math.min(Number(request.nextUrl.searchParams.get('limit')) || 50, 100);
  const logs = await prisma.executionLog.findMany({
    where: networkCode ? { networkCode } : undefined,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  return NextResponse.json(logs);
}
