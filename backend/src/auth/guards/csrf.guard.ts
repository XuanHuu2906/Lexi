import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { timingSafeEqual } from 'crypto';
import type { Request } from 'express';
import { CSRF_COOKIE, CSRF_HEADER } from '../auth-cookies';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/** Methods that never mutate state and so don't need CSRF protection. */
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Double-submit CSRF guard. For state-changing requests on protected routes,
 * requires the `X-CSRF-Token` header to match the (non-httpOnly) `csrf_token`
 * cookie. Skipped for safe methods and `@Public()` routes (login/register/
 * lookup/refresh), which rely on SameSite=Lax + the httpOnly refresh cookie.
 *
 * Defense-in-depth: same-origin (via proxy) + SameSite=Lax already block most
 * CSRF; this catches the residual cases.
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();

    if (SAFE_METHODS.has(req.method.toUpperCase())) {
      return true;
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const cookies = (req.cookies ?? {}) as Record<string, string>;
    const cookieToken = cookies[CSRF_COOKIE];
    const headerToken = req.headers[CSRF_HEADER];

    if (
      !cookieToken ||
      typeof headerToken !== 'string' ||
      !this.safeEqual(cookieToken, headerToken)
    ) {
      throw new ForbiddenException('Invalid or missing CSRF token');
    }

    return true;
  }

  private safeEqual(a: string, b: string): boolean {
    const ab = Buffer.from(a);
    const bb = Buffer.from(b);
    if (ab.length !== bb.length) {
      return false;
    }
    return timingSafeEqual(ab, bb);
  }
}
