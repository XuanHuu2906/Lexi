import type { Response } from 'express';
export declare const ACCESS_COOKIE = "access_token";
export declare const REFRESH_COOKIE = "refresh_token";
export declare const CSRF_COOKIE = "csrf_token";
export declare const CSRF_HEADER = "x-csrf-token";
export declare const REFRESH_COOKIE_PATH = "/api/auth";
export interface AuthCookiePayload {
    accessToken: string;
    refreshToken: string;
    csrfToken: string;
    refreshDays: number;
}
export declare function setAuthCookies(res: Response, p: AuthCookiePayload): void;
export declare function setAccessCookie(res: Response, accessToken: string): void;
export declare function clearAuthCookies(res: Response): void;
