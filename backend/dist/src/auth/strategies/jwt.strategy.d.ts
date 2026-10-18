import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { AuthUser, JwtPayload } from '../types/jwt-payload.type';
import { PrismaService } from '../../prisma/prisma.service';
declare const credentialSource: unique symbol;
type AuthRequest = Request & {
    [credentialSource]?: 'cookie' | 'bearer';
};
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly prisma;
    constructor(config: ConfigService, prisma: PrismaService);
    validate(req: AuthRequest, payload: JwtPayload): Promise<AuthUser>;
}
export {};
