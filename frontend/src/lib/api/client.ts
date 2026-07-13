// Core HTTP client for the Lexi backend.
//
// Everything goes through the same-origin Next.js proxy at `/api/*`, so cookies
// are first-party and sent automatically (`credentials: "include"`). This layer:
//   - attaches the CSRF header on mutating requests (double-submit),
//   - unwraps the `{ success, data }` envelope,
//   - throws a typed `ApiError` on failures,
//   - on a 401 for a protected route, silently refreshes the access token once
//     (deduped across concurrent calls) and retries, else redirects to /login.

import { clearCsrfToken, getCsrfToken, setCsrfToken } from "./csrf";
import type { ApiErrorBody, ApiSuccess } from "./types";

const BASE = "/api";
const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: ApiErrorBody | null,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type QueryValue = string | number | boolean | undefined | null;

export interface RequestOptions {
  method?: Method;
  body?: unknown;
  query?: Record<string, QueryValue>;
  /** Public endpoints skip refresh-on-401 and the auto-redirect to /login. */
  public?: boolean;
  signal?: AbortSignal;
}

function buildQuery(query: Record<string, QueryValue>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

function rawFetch(path: string, opts: RequestOptions): Promise<Response> {
  const method = opts.method ?? "GET";
  const headers: Record<string, string> = {};

  let body: BodyInit | undefined;
  if (opts.body instanceof FormData) {
    // Let the browser set the multipart Content-Type (with boundary).
    body = opts.body;
  } else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.body);
  }

  if (MUTATING.has(method)) {
    const csrf = getCsrfToken();
    if (csrf) headers["X-CSRF-Token"] = csrf;
  }

  const qs = opts.query ? buildQuery(opts.query) : "";
  return fetch(`${BASE}${path}${qs}`, {
    method,
    headers,
    body,
    credentials: "include",
    signal: opts.signal,
  });
}

// Single in-flight refresh shared by all callers that hit a 401 at once.
let refreshInFlight: Promise<boolean> | null = null;

function refreshAccessToken(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(`${BASE}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) return false;
        const json = (await res.json().catch(() => null)) as {
          data?: { csrfToken?: string };
        } | null;
        if (json?.data?.csrfToken) setCsrfToken(json.data.csrfToken);
        return true;
      } catch {
        return false;
      }
    })();
    // Reset once settled so the next 401 can trigger a fresh refresh.
    void refreshInFlight.finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

function onAuthLost(): void {
  clearCsrfToken();
  if (
    typeof window !== "undefined" &&
    !window.location.pathname.startsWith("/login")
  ) {
    window.location.assign("/login");
  }
}

function messageFrom(body: ApiErrorBody | null, res: Response): string {
  if (body) {
    return Array.isArray(body.message)
      ? body.message.join(", ")
      : body.message;
  }
  return res.statusText || `Request failed (${res.status})`;
}

async function unwrap<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;

  const json = (await res.json().catch(() => null)) as
    | ApiSuccess<T>
    | ApiErrorBody
    | null;

  if (!res.ok || !json || (json as ApiErrorBody).success === false) {
    const body = (json as ApiErrorBody) ?? null;
    throw new ApiError(res.status, messageFrom(body, res), body);
  }
  return (json as ApiSuccess<T>).data;
}

export async function apiFetch<T>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  let res = await rawFetch(path, opts);

  if (res.status === 401 && !opts.public) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await rawFetch(path, opts);
    } else {
      onAuthLost();
    }
  }

  return unwrap<T>(res);
}

// Thin verb helpers.
export const api = {
  get: <T>(path: string, opts?: Omit<RequestOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...opts, method: "GET" }),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    apiFetch<T>(path, { ...opts, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    apiFetch<T>(path, { ...opts, method: "PATCH", body }),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    apiFetch<T>(path, { ...opts, method: "PUT", body }),
  delete: <T>(path: string, opts?: RequestOptions) =>
    apiFetch<T>(path, { ...opts, method: "DELETE" }),
};
