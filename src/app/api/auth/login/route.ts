/**
 * POST /api/auth/login
 *
 * Accepts an API token and sets an httpOnly session cookie.
 * Returns 200 on success (with redirect info), 401 on failure.
 */
import { NextResponse } from 'next/server';
import { validateToken, encodeToken, getCookieOptions, getCookieName } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, remember }: { token: string; remember: boolean } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 },
      );
    }

    if (!validateToken(token)) {
      return NextResponse.json(
        { error: 'Invalid token format. Token must be at least 10 characters.' },
        { status: 401 },
      );
    }

    // In production you would verify the token against your auth server here.
    // For now we accept any valid-format token.
    const encodedToken = encodeToken(token.trim());
    const cookieOptions = getCookieOptions(Boolean(remember));

    const response = NextResponse.json(
      {
        success: true,
        redirect: '/chat',
      },
      { status: 200 },
    );

    response.cookies.set(getCookieName(), encodedToken, {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      maxAge: cookieOptions.maxAge,
      path: cookieOptions.path,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 },
    );
  }
}
