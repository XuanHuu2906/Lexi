import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditActor, AuditService } from './audit.service';
import { ListAdminUsersDto } from './dto/user.dto';

// Non-sensitive metadata only — never expose a learner's words, progress,
// writing or recordings here (least-privilege boundary, UCA05).
const USER_SELECT = {
  id: true,
  email: true,
  role: true,
  createdAt: true,
  lastActiveAt: true,
  disabledAt: true,
  disabledReason: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(query: ListAdminUsersDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 7;

    const where: Prisma.UserWhereInput = {
      ...(query.role ? { role: query.role } : {}),
      ...(query.status === 'active' ? { disabledAt: null } : {}),
      ...(query.status === 'locked' ? { disabledAt: { not: null } } : {}),
      ...(query.search
        ? { email: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: USER_SELECT,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async getOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng.');
    return user;
  }

  /** Admin-impose a lock (UCA06). Reason is required and audited. */
  async lock(actor: AuditActor, id: string, reason: string) {
    if (id === actor.userId) {
      throw new ForbiddenException('Không thể tự khóa tài khoản của bạn.');
    }
    const user = await this.getOrThrow(id);
    if (user.disabledAt) return this.getOne(id); // already locked — idempotent

    const updated = await this.prisma.user.update({
      where: { id },
      data: { disabledAt: new Date(), disabledReason: reason.trim() },
      select: USER_SELECT,
    });
    // Force the locked user out of any active session immediately.
    await this.prisma.refreshToken.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    await this.audit.log(actor, {
      action: 'LOCK',
      target: `Người dùng: ${user.email}`,
      reason: reason.trim(),
      before: 'active',
      after: 'locked',
    });
    return updated;
  }

  async unlock(actor: AuditActor, id: string, reason: string) {
    const user = await this.getOrThrow(id);
    if (!user.disabledAt) return this.getOne(id); // already active — idempotent

    const updated = await this.prisma.user.update({
      where: { id },
      data: { disabledAt: null, disabledReason: null },
      select: USER_SELECT,
    });
    await this.audit.log(actor, {
      action: 'UNLOCK',
      target: `Người dùng: ${user.email}`,
      reason: reason.trim(),
      before: 'locked',
      after: 'active',
    });
    return updated;
  }

  private async getOrThrow(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, disabledAt: true },
    });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng.');
    return user;
  }
}
