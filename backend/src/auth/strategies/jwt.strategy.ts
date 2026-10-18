import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ACCESS_COOKIE } from '../auth-cookies';
import { AuthUser, JwtPayload } from '../types/jwt-payload.type';
import { PrismaService } from '../../prisma/prisma.service';

/** Pull the access token from the httpOnly cookie set at login. */
const credentialSource = Symbol('validated-credential-source');
type AuthRequest = Request & { [credentialSource]?: 'cookie' | 'bearer' };

function extractCredential(req: AuthRequest): string | null {
  delete req[credentialSource];
  const cookies = (req.cookies ?? {}) as Record<string, unknown>;
  // Even an empty/invalid cookie must not downgrade to a Bearer credential.
  if (Object.prototype.hasOwnProperty.call(cookies, ACCESS_COOKIE)) {
    req[credentialSource] = 'cookie';
    return typeof cookies[ACCESS_COOKIE] === 'string'
      ? cookies[ACCESS_COOKIE]
      : null;
  }
  const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
  if (token) req[credentialSource] = 'bearer';
  return token;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }
    super({
      // Cookie first (the real flow); Bearer header as a fallback for Swagger
      // and API testing tools.
      jwtFromRequest: extractCredential,
      passReqToCallback: true,
      algorithms: ['HS256'],
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(req: AuthRequest, payload: JwtPayload): Promise<AuthUser> {
    if (
      typeof payload?.sub !== 'string' ||
      !payload.sub ||
      !req[credentialSource]
    ) {
      throw new UnauthorizedException();
    }
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, disabledAt: true, lockedUntil: true },
    });
    if (
      !user ||
      user.disabledAt ||
      (user.lockedUntil && user.lockedUntil > new Date())
    ) {
      throw new UnauthorizedException('Session expired');
    }
    return {
      userId: user.id,
      email: user.email,
      authMechanism: req[credentialSource],
    };
  }
}
