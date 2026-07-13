/** Claims stored inside the signed JWT. */
export interface JwtPayload {
  sub: string; // user id
  email: string;
}

import { UserRole } from '../../../generated/prisma/client';

/** Shape attached to `req.user` after the JwtStrategy validates a token. */
export interface AuthUser {
  userId: string;
  email: string;
  /** Populated by RolesGuard on role-protected routes (read fresh from DB). */
  role?: UserRole;
}
