import { NextResponse } from 'next/server';

const GOOGLE_AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

export async function GET() {
  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      {
        message:
          'Google OAuth client ID is not configured. Set GOOGLE_CLIENT_ID or NEXT_PUBLIC_GOOGLE_CLIENT_ID.',
      },
      { status: 500 },
    );
  }

  const appBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    'http://localhost:3000';

  const redirectUri = `${appBaseUrl}/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    include_granted_scopes: 'true',
    access_type: 'offline',
    prompt: 'consent',
  });

  const authorizeUrl = `${GOOGLE_AUTHORIZE_URL}?${params.toString()}`;

  return NextResponse.redirect(authorizeUrl);
}

