import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../../generated/prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Restricts a route/controller to the given roles. Enforced by RolesGuard,
 * which reads the caller's current role from the DB (not the JWT) so a
 * demotion takes effect immediately.
 *
 *   @Roles(UserRole.ADMIN)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
