import { Injectable } from '@nestjs/common';
import { WordStatus } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StatsPeriod } from './dto/stats-query.dto';

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  /** UC16 — headline learning statistics, optionally scoped to a period. */
  async overview(userId: string, period: StatsPeriod = 'all') {
    const since = this.periodStart(period);
    const reviewWhere = {
      userId,
      ...(since ? { reviewedAt: { gte: since } } : {}),
    };

    const [byStatus, reviews, quizzes] = await Promise.all([
      this.prisma.word.groupBy({
        by: ['status'],
        where: { userId },
        _count: true,
      }),
      this.prisma.reviewLog.findMany({
        where: reviewWhere,
        select: { quality: true, reviewedAt: true },
      }),
      this.prisma.quizResult.findMany({
        where: {
          userId,
          status: 'COMPLETED',
          ...(since ? { completedAt: { gte: since } } : {}),
        },
        select: { score: true, total: true },
      }),
    ]);

    const counts: Record<WordStatus, number> = {
      NEW: 0,
      LEARNING: 0,
      MASTERED: 0,
    };
    for (const g of byStatus) {
      counts[g.status] = g._count;
    }
    const totalWords = counts.NEW + counts.LEARNING + counts.MASTERED;

    const reviewsCount = reviews.length;
    const correct = reviews.filter((r) => r.quality >= 3).length;
    const retentionRate = reviewsCount
      ? Math.round((correct / reviewsCount) * 100)
      : 0;
    const activeDays = new Set(
      reviews.map((r) => this.utcDay(r.reviewedAt).getTime()),
    ).size;

    const quizCount = quizzes.length;
    const avgScorePercent = quizCount
      ? Math.round(
          (quizzes.reduce((a, q) => a + (q.total ? q.score / q.total : 0), 0) /
            quizCount) *
            100,
        )
      : 0;

    return {
      period,
      totalWords,
      mastered: counts.MASTERED,
      learning: counts.LEARNING,
      new: counts.NEW,
      retentionRate, // % of reviews rated as remembered (quality ≥ 3)
      reviewsCount,
      activeDays, // distinct days with reviews (a proxy for study time)
      quizzes: { count: quizCount, avgScorePercent },
    };
  }

  /** UC16 — weakest topics and most-forgotten words. */
  async weakness(userId: string) {
    const logs = await this.prisma.reviewLog.findMany({
      where: { userId },
      select: {
        quality: true,
        word: { select: { topic: true, term: true, meaning: true } },
      },
      orderBy: { reviewedAt: 'desc' },
      take: 1000,
    });

    const topics = new Map<string, { reviews: number; correct: number }>();
    const words = new Map<
      string,
      { term: string; meaning: string; fails: number }
    >();

    for (const l of logs) {
      const topic = l.word.topic ?? 'Uncategorised';
      const t = topics.get(topic) ?? { reviews: 0, correct: 0 };
      t.reviews++;
      if (l.quality >= 3) t.correct++;
      topics.set(topic, t);

      if (l.quality < 3) {
        const w = words.get(l.word.term) ?? {
          term: l.word.term,
          meaning: l.word.meaning,
          fails: 0,
        };
        w.fails++;
        words.set(l.word.term, w);
      }
    }

    const weakTopics = [...topics.entries()]
      .map(([topic, t]) => ({
        topic,
        reviews: t.reviews,
        accuracy: Math.round((t.correct / t.reviews) * 100),
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 10);

    const weakWords = [...words.values()]
      .sort((a, b) => b.fails - a.fails)
      .slice(0, 10);

    return { weakTopics, weakWords };
  }

  private periodStart(period: StatsPeriod): Date | undefined {
    if (period === 'week') return new Date(Date.now() - 7 * DAY_MS);
    if (period === 'month') return new Date(Date.now() - 30 * DAY_MS);
    return undefined;
  }

  private utcDay(d: Date): Date {
    return new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
    );
  }
}
