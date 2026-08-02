import { NextResponse } from 'next/server';

const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';

export async function GET() {
  // const url = new URL(request.url);

  // Read client id from server-side env only
  const clientId =
    process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      {
        message:
          'GitHub OAuth client id is not set (Please define GITHUB_CLIENT_ID or NEXT_PUBLIC_GITHUB_CLIENT_ID)',
      },
      { status: 500 },
    );
  }

  // Base app url for callback (supports production config)
  const appBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    'http://localhost:3000';

  const redirectUri = `${appBaseUrl}/auth/github/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'read:user user:email',
    allow_signup: 'true',
  });

  // To support redirect after login, you can handle the `next` query param and store it in state/cookie later
  const authorizeUrl = `${GITHUB_AUTHORIZE_URL}?${params.toString()}`;

  return NextResponse.redirect(authorizeUrl);
}
