import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../types/jwt-payload.type';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Enforces @Roles(...) after the global JwtAuthGuard has authenticated the
 * request. The caller's role is read from the DB (not the token) so it is
 * always current, and the resolved role is attached to `req.user.role`.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthUser }>();
    const userId = request.user?.userId;
    if (!userId) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user || !required.includes(user.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    if (request.user) request.user.role = user.role;
    return true;
  }
}
