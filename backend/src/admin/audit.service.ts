import { Injectable } from '@nestjs/common';
import { AuditAction, Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListAuditDto } from './dto/list-audit.dto';

/** The acting admin, taken from `req.user` on every admin write. */
export interface AuditActor {
  userId: string;
  email: string;
}

/** Narrow the authenticated user down to the audit actor. */
export function auditActor(user: { userId: string; email: string }): AuditActor {
  return { userId: user.userId, email: user.email };
}

export interface AuditInput {
  action: AuditAction;
  target: string;
  reason?: string;
  before?: string;
  after?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  /** Append one entry to the audit trail (UCA08). */
  log(actor: AuditActor, input: AuditInput) {
    return this.prisma.auditLog.create({
      data: {
        adminId: actor.userId,
        adminEmail: actor.email,
        action: input.action,
        target: input.target,
        reason: input.reason,
        before: input.before,
        after: input.after,
      },
    });
  }

  /** Read-only, newest-first, filterable by admin + action. */
  async list(query: ListAuditDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.AuditLogWhereInput = {
      ...(query.admin ? { adminEmail: query.admin } : {}),
      ...(query.action ? { action: query.action } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  /** Distinct admin emails present in the log (for the filter dropdown). */
  async admins() {
    const rows = await this.prisma.auditLog.findMany({
      distinct: ['adminEmail'],
      select: { adminEmail: true },
      orderBy: { adminEmail: 'asc' },
    });
    return rows.map((r) => r.adminEmail);
  }
}
