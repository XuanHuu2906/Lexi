import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WordStatus } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AnswerDto, RATING_QUALITY } from './dto/answer.dto';
import { FlashcardMode, FlashcardScope } from './dto/flashcards.dto';
import { sm2 } from './sm2';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  /** UC09 — words whose next review is due (nextReviewAt <= now). */
  async due(userId: string, limit = 20) {
    const now = new Date();
    const where = {
      userId,
      srsData: { is: { nextReviewAt: { lte: now } } },
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.word.findMany({
        where,
        include: { srsData: true },
        orderBy: { srsData: { nextReviewAt: 'asc' } },
        take: limit,
      }),
      this.prisma.word.count({ where }),
    ]);
    return { items, count: items.length, total };
  }

  /** UC09 — record a review answer and reschedule via SM-2. */
  async answer(userId: string, dto: AnswerDto) {
    const quality = RATING_QUALITY[dto.rating];
    const word = await this.prisma.word.findFirst({
      where: { id: dto.wordId, userId },
      include: { srsData: true },
    });
    if (!word || !word.srsData) {
      throw new NotFoundException('Word not found');
    }

    const now = new Date();
    const next = sm2(
      {
        interval: word.srsData.interval,
        easeFactor: word.srsData.easeFactor,
        repetitions: word.srsData.repetitions,
      },
      quality,
      now,
    );

    const status: WordStatus =
      next.interval >= 21 ? WordStatus.MASTERED : WordStatus.LEARNING;

    const [srsData] = await this.prisma.$transaction([
      this.prisma.srsData.update({
        where: { wordId: word.id },
        data: {
          interval: next.interval,
          easeFactor: next.easeFactor,
          repetitions: next.repetitions,
          nextReviewAt: next.nextReviewAt,
          lastQuality: quality,
          lastReviewedAt: now,
        },
      }),
      this.prisma.reviewLog.create({
        data: { userId, wordId: word.id, quality },
      }),
      this.prisma.word.update({
        where: { id: word.id },
        data: { status },
      }),
    ]);

    return { srsData, status, nextReviewAt: next.nextReviewAt };
  }

  /** UC10 — build flashcards for the chosen mode. */
  async flashcards(
    userId: string,
    mode: FlashcardMode = 'guess',
    limit = 10,
    scope: FlashcardScope = 'due',
  ) {
    // Pull a pool: due words first, then the rest — enough to build distractors
    // and to serve as the default (spaced-repetition) deck.
    const pool = await this.prisma.word.findMany({
      where: { userId },
      include: { srsData: true },
      orderBy: [{ srsData: { nextReviewAt: 'asc' } }, { createdAt: 'desc' }],
      take: Math.max(limit, 20),
    });

    if (pool.length === 0) {
      throw new BadRequestException('You have no saved words to review yet');
    }

    // Choose the cards. Default: the due-first deck, capped at `limit`.
    // scope='today': all words added today; fall back to the due deck if none.
    let selected = pool.slice(0, limit);
    let servedScope: FlashcardScope = 'due';
    if (scope === 'today') {
      const start = startOfTodayVN();
      const todays = await this.prisma.word.findMany({
        where: { userId, createdAt: { gte: start } },
        include: { srsData: true },
        orderBy: { createdAt: 'desc' },
      });
      if (todays.length > 0) {
        selected = todays;
        servedScope = 'today';
      }
    }

    if (mode === 'match' && selected.length < 4) {
      throw new BadRequestException('Need at least 4 words for match mode');
    }

    // Distractors are drawn from the wider notebook so options stay varied even
    // when only a couple of words were added today.
    const meanings = Array.from(
      new Set([...pool, ...selected].map((w) => w.meaning)),
    );

    const cards = selected.map((w) => {
      const base = {
        wordId: w.id,
        term: w.term,
        meaning: w.meaning,
        phonetic: w.phonetic,
        examples: w.examples,
      };
      if (mode === 'guess' || mode === 'listen') {
        return { ...base, ...this.buildOptions(w.meaning, meanings) };
      }
      if (mode === 'fill') {
        return { ...base, cloze: this.buildCloze(w.term, w.examples) };
      }
      return base; // match / plain
    });

    return { mode, scope: servedScope, count: cards.length, cards };
  }

  /** 4 shuffled options (correct meaning + 3 distractors) with the answer index. */
  private buildOptions(
    correct: string,
    pool: string[],
  ): { options: string[]; answerIndex: number } {
    const distractors = this.shuffle(pool.filter((m) => m !== correct)).slice(
      0,
      3,
    );
    const options = this.shuffle([correct, ...distractors]);
    return { options, answerIndex: options.indexOf(correct) };
  }

  /** Blank out the term in one of its example sentences. */
  private buildCloze(term: string, examples: string[]): string | null {
    const re = new RegExp(this.escapeRegExp(term), 'i');
    const hit = examples.find((e) => re.test(e));
    return hit ? hit.replace(re, '_____') : null;
  }

  private shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  private escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

// Start of "today" in Vietnam time (UTC+7, no DST) as a UTC instant, so
// "words added today" matches the learner's calendar day regardless of where
// the server runs.
const DAY_MS = 24 * 60 * 60 * 1000;
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;
function startOfTodayVN(): Date {
  const vnNow = Date.now() + VN_OFFSET_MS; // shift so VN wall-clock aligns to UTC
  const vnMidnight = Math.floor(vnNow / DAY_MS) * DAY_MS; // floor to VN 00:00
  return new Date(vnMidnight - VN_OFFSET_MS); // back to the real UTC instant
}
