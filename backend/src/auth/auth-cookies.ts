import type { CookieOptions, Response } from 'express';

/**
 * Centralised cookie names, paths, and options for cookie-based auth.
 *
 * Everything reaches the browser through the Next.js proxy, so the browser sees
 * same-origin `/api/*` URLs. Cookie *paths* are therefore the browser-facing
 * paths (`/api/...`), NOT the backend's own route paths (`/auth/...`).
 */
export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';
export const CSRF_COOKIE = 'csrf_token';
export const CSRF_HEADER = 'x-csrf-token';

/**
 * The refresh token is only ever sent to the auth endpoints, so scope its
 * cookie to `/api/auth` (browser path). Login, refresh, and logout all live
 * under it.
 */
export const REFRESH_COOKIE_PATH = '/api/auth';

function isProd(): boolean {
  return process.env.NODE_ENV === 'production';
}

/** Shared options. `sameSite: 'lax'` is safe because the proxy makes auth same-origin. */
function baseOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd(),
    path: '/',
  };
}

export interface AuthCookiePayload {
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
  /** Refresh lifetime in days — drives the refresh + csrf cookie maxAge. */
  refreshDays: number;
}

/**
 * Set all three auth cookies on the response.
 * - `access_token`: httpOnly session cookie (its own JWT exp governs validity;
 *   when it expires the client silently refreshes).
 * - `refresh_token`: httpOnly, long-lived, scoped to the auth endpoints.
 * - `csrf_token`: readable by JS (double-submit), long-lived to outlive access.
 */
export function setAuthCookies(res: Response, p: AuthCookiePayload): void {
  const refreshMaxAge = p.refreshDays * 24 * 60 * 60 * 1000;

  res.cookie(ACCESS_COOKIE, p.accessToken, baseOptions());

  res.cookie(REFRESH_COOKIE, p.refreshToken, {
    ...baseOptions(),
    path: REFRESH_COOKIE_PATH,
    maxAge: refreshMaxAge,
  });

  res.cookie(CSRF_COOKIE, p.csrfToken, {
    ...baseOptions(),
    httpOnly: false, // must be readable by the frontend to echo in a header
    maxAge: refreshMaxAge,
  });
}

/** Refresh the access cookie only (used on token rotation via /auth/refresh). */
export function setAccessCookie(res: Response, accessToken: string): void {
  res.cookie(ACCESS_COOKIE, accessToken, baseOptions());
}

/** Clear all auth cookies (logout). Paths must match how they were set. */
export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE, { ...baseOptions() });
  res.clearCookie(REFRESH_COOKIE, {
    ...baseOptions(),
    path: REFRESH_COOKIE_PATH,
  });
  res.clearCookie(CSRF_COOKIE, { ...baseOptions(), httpOnly: false });
}
