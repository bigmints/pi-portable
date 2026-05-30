/**
 * Next.js Middleware — Route protection
 *
 * - Protects /chat, /chat/*, /jobs, /settings
 * - Redirects unauthenticated users to /login?callbackUrl=<current_path>
 * - Redirects authenticated users away from /login to /chat
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession, getCookieName } from '@/lib/auth';

// Paths that never require authentication
const PUBLIC_PATHS = ['/login'];

// Regex patterns
const LOGIN_REGEX = /^\/login(?:\/|$)/;
const AUTH_API_REGEX = /^\/api\/auth\//;
const STATIC_ASSET_REGEX = /^\/(next\/static|_next\/|favicon\.|manifest\.|sw\.|offline\.|icons?\/)/i;

// Protected routes
const PROTECTED_ROUTES = ['/chat', '/jobs', '/settings'];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => {
    if (route === '/chat') {
      // Match /chat and /chat/*
      return pathname === '/chat' || pathname.startsWith('/chat/');
    }
    return pathname === route || pathname.startsWith(route + '/');
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for auth API routes and static assets
  if (AUTH_API_REGEX.test(pathname) || STATIC_ASSET_REGEX.test(pathname)) {
    return NextResponse.next();
  }

  // If on /login and already authenticated, redirect to /chat
  if (PUBLIC_PATHS.includes(pathname) || LOGIN_REGEX.test(pathname)) {
    const sessionCookie = request.cookies.get(getCookieName());
    if (sessionCookie && verifySession(sessionCookie.value)) {
      return NextResponse.redirect(new URL('/chat', request.url));
    }
    return NextResponse.next();
  }

  // Check authentication for protected routes
  if (isProtectedRoute(pathname)) {
    const sessionCookie = request.cookies.get(getCookieName());

    if (sessionCookie && verifySession(sessionCookie.value)) {
      // Authenticated — proceed
      return NextResponse.next();
    }

    // Not authenticated — redirect to login with callbackUrl
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Public route — proceed
  return NextResponse.next();
}

// Apply middleware to all routes except static files and API routes
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon)
     * - public assets (images, icons, manifest, etc.)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|manifest\\.json|sw\\.js|offline\\.html|icons?\\/).*)',
  ],
};
