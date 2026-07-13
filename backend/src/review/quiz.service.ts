import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, QuizStatus } from '../../generated/prisma/client';
import { AiService } from '../ai/ai.service';
import { QuizQuestion } from '../ai/features/quiz';
import { PrismaService } from '../prisma/prisma.service';
import {
  GenerateQuizDto,
  SaveQuizProgressDto,
  SubmitQuizDto,
} from './dto/quiz.dto';

type StoredQuestion = QuizQuestion & { userAnswer?: number };

type PoolWord = {
  id: string;
  term: string;
  meaning: string;
  quizzedInCycle: boolean;
  srsData: { nextReviewAt: Date; easeFactor: number } | null;
};

@Injectable()
export class QuizService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  /** UC11 — generate an MCQ quiz from the user's words. */
  async generate(userId: string, dto: GenerateQuizDto) {
    const count = dto.count ?? 10;
    const pool = await this.prisma.word.findMany({
      where: { userId },
      select: {
        id: true,
        term: true,
        meaning: true,
        quizzedInCycle: true,
        srsData: { select: { nextReviewAt: true, easeFactor: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (pool.length < 4) {
      throw new BadRequestException(
        'Add at least 4 words to your notebook to generate a quiz',
      );
    }

    // Phase 1 — rotation + SRS-priority: pick WHICH words to test, covering
    // every word once before any repeats (and marking them for this cycle).
    const selected = await this.selectCycleWords(userId, pool, count);
    // Phase 2 — Fisher-Yates: randomise the display order so it isn't predictable.
    this.shuffle(selected);

    const words = selected.map((w) => ({ term: w.term, meaning: w.meaning }));
    const { questions } = await this.ai.generateQuiz(words);

    const quiz = await this.prisma.quizResult.create({
      data: {
        userId,
        total: questions.length,
        status: QuizStatus.IN_PROGRESS,
        questions: questions as unknown as Prisma.InputJsonValue,
      },
    });

    return {
      quizId: quiz.id,
      total: questions.length,
      questions: this.clientQuestions(questions),
    };
  }

  /** Resume: returns questions (answers hidden until completed) + saved progress. */
  async get(userId: string, id: string) {
    const quiz = await this.findOwned(userId, id);
    const questions = this.stored(quiz.questions);
    const completed = quiz.status === QuizStatus.COMPLETED;
    return {
      quizId: quiz.id,
      total: quiz.total,
      score: quiz.score,
      status: quiz.status,
      questions: questions.map((q, i) => ({
        index: i,
        term: q.term,
        question: q.question,
        options: q.options,
        userAnswer: q.userAnswer ?? null,
        ...(completed
          ? { answerIndex: q.answerIndex, explanation: q.explanation }
          : {}),
      })),
    };
  }

  /** Save partial answers without grading (resume later). */
  async saveProgress(userId: string, id: string, dto: SaveQuizProgressDto) {
    const quiz = await this.findOwned(userId, id);
    if (quiz.status === QuizStatus.COMPLETED) {
      throw new BadRequestException('Quiz already submitted');
    }
    const questions = this.stored(quiz.questions);
    questions.forEach((q, i) => {
      if (dto.answers[i] !== undefined) q.userAnswer = dto.answers[i];
    });
    await this.prisma.quizResult.update({
      where: { id },
      data: { questions: questions as unknown as Prisma.InputJsonValue },
    });
    return { saved: true };
  }

  /** UC11 — grade and finalise a quiz. */
  async submit(userId: string, dto: SubmitQuizDto) {
    const quiz = await this.findOwned(userId, dto.quizId);
    if (quiz.status === QuizStatus.COMPLETED) {
      throw new BadRequestException('Quiz already submitted');
    }
    const questions = this.stored(quiz.questions);

    let score = 0;
    const results = questions.map((q, i) => {
      const given = dto.answers[i] ?? -1;
      const correct = given === q.answerIndex;
      if (correct) score++;
      q.userAnswer = given;
      return {
        index: i,
        correct,
        yourAnswer: given,
        answerIndex: q.answerIndex,
        explanation: q.explanation,
      };
    });

    await this.prisma.quizResult.update({
      where: { id: quiz.id },
      data: {
        score,
        status: QuizStatus.COMPLETED,
        completedAt: new Date(),
        questions: questions as unknown as Prisma.InputJsonValue,
      },
    });

    return { quizId: quiz.id, score, total: quiz.total, results };
  }

  private async findOwned(userId: string, id: string) {
    const quiz = await this.prisma.quizResult.findFirst({
      where: { id, userId },
    });
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }
    return quiz;
  }

  private stored(json: Prisma.JsonValue | null): StoredQuestion[] {
    return (json ?? []) as unknown as StoredQuestion[];
  }

  /**
   * Rotation layer on top of SRS priority (UC11). Each word carries a
   * `quizzedInCycle` flag. We only pick from words not yet quizzed in the
   * current cycle, so every word is covered once before any repeats. When the
   * remaining un-quizzed words can't fill a full quiz, the cycle resets (flags
   * cleared for all of the user's words) and we top up from the fresh pool —
   * without repeating a word inside the same quiz. The chosen words are then
   * marked as quizzed for the (possibly new) cycle.
   */
  private async selectCycleWords(
    userId: string,
    pool: PoolWord[],
    count: number,
  ): Promise<PoolWord[]> {
    const unquizzed = pool.filter((w) => !w.quizzedInCycle);
    let selected = this.selectBySrsPriority(unquizzed, count);

    if (selected.length < count) {
      // Cycle exhausted: serve the leftovers, then start a new cycle to fill the
      // rest — excluding words already chosen so one quiz never repeats a word.
      await this.prisma.word.updateMany({
        where: { userId },
        data: { quizzedInCycle: false },
      });
      const chosen = new Set(selected.map((w) => w.id));
      const remaining = pool.filter((w) => !chosen.has(w.id));
      const fill = this.selectBySrsPriority(remaining, count - selected.length);
      selected = [...selected, ...fill];
    }

    // Mark the chosen words as covered in the current cycle.
    if (selected.length > 0) {
      await this.prisma.word.updateMany({
        where: { id: { in: selected.map((w) => w.id) } },
        data: { quizzedInCycle: true },
      });
    }
    return selected;
  }

  /**
   * Phase 1 — choose WHICH words to test, by SM-2 priority:
   *   1. Due words (nextReviewAt <= now), most overdue first.
   *   2. Then the hardest remaining words (lowest easeFactor first).
   *   3. Then anything left (words with no SRS history yet).
   * Returns up to `count` words, ordered by priority (most-needed first).
   */
  private selectBySrsPriority(pool: PoolWord[], count: number): PoolWord[] {
    const now = Date.now();
    const isDue = (w: PoolWord) =>
      w.srsData != null && w.srsData.nextReviewAt.getTime() <= now;

    const due = pool
      .filter(isDue)
      .sort(
        (a, b) =>
          a.srsData!.nextReviewAt.getTime() - b.srsData!.nextReviewAt.getTime(),
      );
    const hard = pool
      .filter((w) => !isDue(w) && w.srsData != null)
      .sort((a, b) => a.srsData!.easeFactor - b.srsData!.easeFactor);
    const rest = pool.filter((w) => w.srsData == null);

    return [...due, ...hard, ...rest].slice(0, count);
  }

  /** Phase 2 — Fisher-Yates in-place shuffle so question order isn't predictable. */
  private shuffle<T>(arr: T[]): void {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  private clientQuestions(questions: QuizQuestion[]) {
    // Never leak the correct answer/explanation before submission.
    return questions.map((q, i) => ({
      index: i,
      term: q.term,
      question: q.question,
      options: q.options,
    }));
  }
}
