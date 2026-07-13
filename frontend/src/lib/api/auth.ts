import { api } from "./client";
import { clearCsrfToken, setCsrfToken } from "./csrf";
import type { ApiUser } from "./types";

interface AuthResult {
  user: ApiUser;
  csrfToken: string;
}

/** Log in; the backend sets auth cookies and returns a CSRF token to seed. */
export async function login(
  email: string,
  password: string,
): Promise<ApiUser> {
  const res = await api.post<AuthResult>(
    "/auth/login",
    { email, password },
    { public: true },
  );
  setCsrfToken(res.csrfToken);
  return res.user;
}

export async function register(
  email: string,
  password: string,
): Promise<ApiUser> {
  const res = await api.post<AuthResult>(
    "/auth/register",
    { email, password },
    { public: true },
  );
  setCsrfToken(res.csrfToken);
  return res.user;
}

export async function logout(): Promise<void> {
  // Public: must succeed even if the access token has already expired.
  await api.post<{ message: string }>("/auth/logout", undefined, {
    public: true,
  });
  clearCsrfToken();
}
