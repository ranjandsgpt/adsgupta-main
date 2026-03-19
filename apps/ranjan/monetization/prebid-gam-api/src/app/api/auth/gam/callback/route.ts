import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const BASE = process.env.BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  if (error) {
    return NextResponse.redirect(`${BASE}?gam_error=${encodeURIComponent(error)}`);
  }
  if (!code || !state) {
    return NextResponse.redirect(`${BASE}?gam_error=missing_code_or_state`);
  }
  let networkCode = '';
  try {
    networkCode = JSON.parse(Buffer.from(state, 'base64url').toString())?.networkCode || '';
  } catch {
    return NextResponse.redirect(`${BASE}?gam_error=invalid_state`);
  }
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${BASE}/api/auth/gam/callback`;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${BASE}?gam_error=server_config`);
  }
  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const data = await tokenRes.json().catch(() => ({}));
  if (!tokenRes.ok) {
    return NextResponse.redirect(`${BASE}?gam_error=${encodeURIComponent(data.error_description || data.error || 'token_failed')}`);
  }
  const accessToken = data.access_token;
  const refreshToken = data.refresh_token || null;
  const expiresIn = Number(data.expires_in) || 3600;
  const expiresAt = new Date(Date.now() + expiresIn * 1000);
  await prisma.gamConnection.upsert({
    where: { networkCode },
    create: {
      networkCode,
      accessToken,
      refreshToken,
      expiresAt,
    },
    update: { accessToken, refreshToken, expiresAt },
  });
  return NextResponse.redirect(`${BASE}?gam_connected=1&networkCode=${encodeURIComponent(networkCode)}`);
}
