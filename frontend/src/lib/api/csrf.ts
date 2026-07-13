// CSRF token handling for the double-submit scheme.
//
// The backend sets a non-httpOnly `csrf_token` cookie AND echoes the value in
// the login/register/refresh response body. We prefer the in-memory seed right
// after auth (the cookie may not be readable in the same tick), and fall back
// to reading the cookie for normal page loads.

let seeded: string | null = null;

export function setCsrfToken(token: string): void {
  seeded = token;
}

export function clearCsrfToken(): void {
  seeded = null;
}

export function getCsrfToken(): string | null {
  if (seeded) return seeded;
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}
