import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminStatsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Aggregate, system-wide health counts (UCA07) — no per-user data. */
  async overview() {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [totalUsers, activeUsers, totalWords, totalScenarios, lockedUsers] =
      await this.prisma.$transaction([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { lastActiveAt: { gte: since } } }),
        this.prisma.toeicWord.count(),
        this.prisma.conversationScenario.count(),
        this.prisma.user.count({ where: { disabledAt: { not: null } } }),
      ]);

    return { totalUsers, activeUsers, totalWords, totalScenarios, lockedUsers };
  }
}
