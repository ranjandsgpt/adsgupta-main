import { NextRequest, NextResponse } from 'next/server';

const SCOPE = 'https://www.googleapis.com/auth/dfp';
const BASE = process.env.BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  const networkCode = request.nextUrl.searchParams.get('networkCode') || '';
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${BASE}/api/auth/gam/callback`;
  if (!clientId) {
    return NextResponse.json({ error: 'GOOGLE_CLIENT_ID not configured' }, { status: 500 });
  }
  const state = Buffer.from(JSON.stringify({ networkCode })).toString('base64url');
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', SCOPE);
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'consent');
  url.searchParams.set('state', state);
  return NextResponse.redirect(url.toString());
}
