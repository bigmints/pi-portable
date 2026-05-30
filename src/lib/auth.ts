/**
 * Auth utilities for pi-app
 *
 * Handles token validation, cookie management, and session helpers.
 */

import type { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'pi_session';
const REMEMBER_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds
const SESSION_MAX_AGE = 24 * 60 * 60; // 1 day in seconds

/**
 * Validates an API token format.
 * - Must be non-empty
 * - Minimum 10 characters
 * - Must match a basic token pattern (alphanumeric, hyphens, underscores, dots)
 */
export function validateToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const trimmed = token.trim();
  if (trimmed.length < 10) {
    return false;
  }

  return /^[a-zA-Z0-9\-_.]+$/.test(trimmed);
}

/**
 * Verifies whether a session cookie value represents a valid session.
 *
 * @param cookie - The raw cookie string value (may be undefined)
 * @returns true if the cookie decodes to a valid token
 */
export function verifySession(cookie: string | undefined): boolean {
  if (!cookie) {
    return false;
  }

  // Cookie stores a base64-encoded token
  try {
    const decoded = decodeToken(cookie);
    return validateToken(decoded);
  } catch {
    return false;
  }
}

/**
 * Encodes a token for storage in the cookie (base64).
 */
export function encodeToken(token: string): string {
  return Buffer.from(token).toString('base64');
}

/**
 * Decodes a token from the cookie (base64).
 */
export function decodeToken(encoded: string): string {
  return Buffer.from(encoded, 'base64').toString('utf-8');
}

/**
 * Returns cookie options for the session cookie.
 *
 * @param remember - If true, cookie lasts 30 days; otherwise 1 day
 */
export function getCookieOptions(remember: boolean): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax';
  maxAge: number;
  path: string;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: remember ? REMEMBER_MAX_AGE : SESSION_MAX_AGE,
    path: '/',
  };
}

/**
 * Returns the cookie name used for sessions.
 */
export function getCookieName(): string {
  return COOKIE_NAME;
}

/**
 * Sets the `pi_session` cookie on a `NextResponse`.
 *
 * @param response - The response to attach the cookie to
 * @param token - The auth token value
 * @param remember - If true, cookie lasts 30 days; otherwise 1 day
 */
export function setAuthCookie(
  response: NextResponse,
  token: string,
  remember: boolean,
): void {
  const encoded = encodeToken(token);
  response.cookies.set(COOKIE_NAME, encoded, getCookieOptions(remember));
}

/**
 * Clears the `pi_session` cookie by setting `maxAge` to 0.
 *
 * @param response - The response to clear the cookie on
 */
export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' });
}

/**
 * Reads the `pi_session` cookie from a `NextRequest` and returns
 * the decoded token string (or `undefined` if absent/invalid).
 *
 * @param request - The incoming request
 * @returns The decoded token, or `undefined`
 */
export function getAuthCookie(
  request: NextRequest,
): string | undefined {
  const raw = request.cookies.get(COOKIE_NAME)?.value;
  if (!raw) {
    return undefined;
  }

  try {
    return decodeToken(raw);
  } catch {
    return undefined;
  }
}
