import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { QuizService } from './quiz.service';

type PoolWord = {
  id: string;
  term: string;
  meaning: string;
  quizzedInCycle: boolean;
  srsData: { nextReviewAt: Date; easeFactor: number } | null;
};

// selectBySrsPriority / shuffle are pure and don't touch Prisma or the AI
// client, so a service with empty deps is enough to exercise them.
function makeService(): QuizService {
  return new QuizService(
    {} as unknown as PrismaService,
    {} as unknown as AiService,
  );
}

function select(pool: PoolWord[], count: number): PoolWord[] {
  const svc = makeService() as unknown as {
    selectBySrsPriority(pool: PoolWord[], count: number): PoolWord[];
  };
  return svc.selectBySrsPriority(pool, count);
}

const DAY = 24 * 60 * 60 * 1000;

function word(
  term: string,
  srsData: { nextReviewAt: Date; easeFactor: number } | null = null,
): PoolWord {
  return { id: term, term, meaning: `${term}-vi`, quizzedInCycle: false, srsData };
}

function due(daysOverdue: number, easeFactor = 2.5) {
  return { nextReviewAt: new Date(Date.now() - daysOverdue * DAY), easeFactor };
}

function notDue(daysAhead: number, easeFactor = 2.5) {
  return { nextReviewAt: new Date(Date.now() + daysAhead * DAY), easeFactor };
}

const terms = (pool: PoolWord[]) => pool.map((w) => w.term);

describe('QuizService.selectBySrsPriority', () => {
  it('picks due words first, most overdue first', () => {
    const pool = [
      word('a', due(1)),
      word('b', due(10)),
      word('c', due(3)),
    ];
    expect(terms(select(pool, 3))).toEqual(['b', 'c', 'a']);
  });

  it('fills with the hardest (lowest easeFactor) words when due words run out', () => {
    const pool = [
      word('due', due(2)),
      word('easy', notDue(5, 2.8)),
      word('hard', notDue(5, 1.4)),
      word('medium', notDue(5, 2.1)),
    ];
    // due first, then non-due ordered by ascending easeFactor.
    expect(terms(select(pool, 3))).toEqual(['due', 'hard', 'medium']);
  });

  it('falls back to words with no SRS history last', () => {
    const pool = [
      word('fresh1'),
      word('due', due(1)),
      word('hard', notDue(3, 1.5)),
      word('fresh2'),
    ];
    // Tier order: due -> hard -> no-srs. New words come last.
    expect(terms(select(pool, 4))).toEqual(['due', 'hard', 'fresh1', 'fresh2']);
  });

  it('honours the count limit, keeping only the highest-priority words', () => {
    const pool = [
      word('due-old', due(10)),
      word('due-new', due(1)),
      word('hard', notDue(2, 1.2)),
      word('fresh'),
    ];
    expect(terms(select(pool, 2))).toEqual(['due-old', 'due-new']);
  });

  it('treats nextReviewAt exactly at now as due', () => {
    const pool = [word('boundary', { nextReviewAt: new Date(), easeFactor: 2 })];
    expect(terms(select(pool, 1))).toEqual(['boundary']);
  });

  it('returns the whole pool when count exceeds its size', () => {
    const pool = [word('due', due(1)), word('hard', notDue(1, 1.3)), word('new')];
    expect(terms(select(pool, 10))).toEqual(['due', 'hard', 'new']);
  });
});
