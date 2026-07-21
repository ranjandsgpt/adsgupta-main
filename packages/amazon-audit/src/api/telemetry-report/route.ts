/**
 * Telemetry report API — Returns latest audit run reports for diagnostics page.
 */

import { NextResponse } from 'next/server';
import { getLatestReports } from '@adsgupta/amazon-audit/agents/platformTelemetryAgent';

export async function GET() {
  const reports = getLatestReports(5);
  return NextResponse.json({ reports });
}
