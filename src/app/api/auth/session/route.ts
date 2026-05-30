/**
 * GET /api/auth/session
 *
 * Returns the current session status. 200 if authenticated, 401 if not.
 */
import { NextResponse } from 'next/server';
import { verifySession, getCookieName } from '@/lib/auth';

export async function GET(request: Request) {
  const cookieHeader = request.headers.get('cookie');
  const cookieName = getCookieName();

  let cookieValue: string | undefined;
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map((c) => c.trim());
    const sessionCookie = cookies.find((c) => c.startsWith(`${cookieName}=`));
    if (sessionCookie) {
      cookieValue = sessionCookie.slice(cookieName.length + 1);
    }
  }

  if (!cookieValue || !verifySession(cookieValue)) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 },
    );
  }

  return NextResponse.json(
    { authenticated: true },
    { status: 200 },
  );
}
