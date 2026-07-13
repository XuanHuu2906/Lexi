"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REFRESH_COOKIE_PATH = exports.CSRF_HEADER = exports.CSRF_COOKIE = exports.REFRESH_COOKIE = exports.ACCESS_COOKIE = void 0;
exports.setAuthCookies = setAuthCookies;
exports.setAccessCookie = setAccessCookie;
exports.clearAuthCookies = clearAuthCookies;
exports.ACCESS_COOKIE = 'access_token';
exports.REFRESH_COOKIE = 'refresh_token';
exports.CSRF_COOKIE = 'csrf_token';
exports.CSRF_HEADER = 'x-csrf-token';
exports.REFRESH_COOKIE_PATH = '/api/auth';
function isProd() {
    return process.env.NODE_ENV === 'production';
}
function baseOptions() {
    return {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd(),
        path: '/',
    };
}
function setAuthCookies(res, p) {
    const refreshMaxAge = p.refreshDays * 24 * 60 * 60 * 1000;
    res.cookie(exports.ACCESS_COOKIE, p.accessToken, baseOptions());
    res.cookie(exports.REFRESH_COOKIE, p.refreshToken, {
        ...baseOptions(),
        path: exports.REFRESH_COOKIE_PATH,
        maxAge: refreshMaxAge,
    });
    res.cookie(exports.CSRF_COOKIE, p.csrfToken, {
        ...baseOptions(),
        httpOnly: false,
        maxAge: refreshMaxAge,
    });
}
function setAccessCookie(res, accessToken) {
    res.cookie(exports.ACCESS_COOKIE, accessToken, baseOptions());
}
function clearAuthCookies(res) {
    res.clearCookie(exports.ACCESS_COOKIE, { ...baseOptions() });
    res.clearCookie(exports.REFRESH_COOKIE, {
        ...baseOptions(),
        path: exports.REFRESH_COOKIE_PATH,
    });
    res.clearCookie(exports.CSRF_COOKIE, { ...baseOptions(), httpOnly: false });
}
//# sourceMappingURL=auth-cookies.js.map