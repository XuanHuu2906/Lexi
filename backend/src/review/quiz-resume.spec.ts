import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';

function setup() {
  const quizResult = { findFirst: jest.fn(), updateMany: jest.fn() };
  const service = new QuizService(
    { quizResult } as unknown as PrismaService,
    {} as AiService,
  );
  const quiz = {
    id: 'quiz-a', userId: 'account-a', total: 1, score: 0, status: 'IN_PROGRESS',
    questions: [{ term: 'apple', question: 'Meaning?', options: ['fruit', 'book'], answerIndex: 0, explanation: 'A fruit.', userAnswer: 1 }],
  };
  return { quizResult, service, quiz };
}

describe('Quiz resume and finalisation', () => {
  it('finds only the authenticated account latest quiz and hides answers', async () => {
    const { quizResult, service, quiz } = setup();
    quizResult.findFirst.mockResolvedValueOnce({ id: quiz.id }).mockResolvedValueOnce(quiz);
    const result = await new QuizController(service).latest('account-a');
    expect(quizResult.findFirst).toHaveBeenNthCalledWith(1, {
      where: { userId: 'account-a' }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], select: { id: true },
    });
    expect(quizResult.findFirst).toHaveBeenNthCalledWith(2, { where: { id: quiz.id, userId: 'account-a' } });
    expect(result.quiz?.questions[0]).toEqual({ index: 0, term: 'apple', question: 'Meaning?', options: ['fruit', 'book'], userAnswer: 1 });
  });

  it('returns null when the account has no quiz', async () => {
    const { quizResult, service } = setup();
    quizResult.findFirst.mockResolvedValue(null);
    await expect(service.latest('new-account')).resolves.toEqual({ quiz: null });
  });

  it('returns the saved score and explanations only after completion', async () => {
    const { quizResult, service, quiz } = setup();
    quizResult.findFirst.mockResolvedValueOnce({ id: quiz.id }).mockResolvedValueOnce({ ...quiz, status: 'COMPLETED', score: 1 });
    const result = await service.latest('account-a');
    expect(result.quiz?.score).toBe(1);
    expect(result.quiz?.questions[0].answerIndex).toBe(0);
    expect(result.quiz?.questions[0].explanation).toBe('A fruit.');
  });

  it('does not reveal another account quiz through the ID route', async () => {
    const { quizResult, service } = setup();
    quizResult.findFirst.mockResolvedValue(null);
    await expect(service.get('account-b', 'quiz-a')).rejects.toBeInstanceOf(NotFoundException);
    expect(quizResult.findFirst).toHaveBeenCalledWith({ where: { id: 'quiz-a', userId: 'account-b' } });
  });

  it('guards PATCH at write time so a late progress request cannot overwrite completed answers', async () => {
    const { quizResult, service, quiz } = setup();
    quizResult.findFirst.mockResolvedValue(quiz);
    quizResult.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.saveProgress('account-a', quiz.id, { answers: [0] })).rejects.toBeInstanceOf(BadRequestException);
    expect(quizResult.updateMany).toHaveBeenCalledWith({
      where: { id: quiz.id, userId: 'account-a', status: 'IN_PROGRESS' },
      data: { questions: [expect.objectContaining({ userAnswer: 0 })] },
    });
  });

  it('allows only one concurrent submit to finalise the quiz', async () => {
    const { quizResult, service, quiz } = setup();
    quizResult.findFirst.mockResolvedValue(quiz);
    quizResult.updateMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });
    const responses = await Promise.allSettled([
      service.submit('account-a', { quizId: quiz.id, answers: [0] }),
      service.submit('account-a', { quizId: quiz.id, answers: [1] }),
    ]);
    expect(responses.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(responses.filter((r) => r.status === 'rejected')).toHaveLength(1);
    expect(quizResult.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: quiz.id, userId: 'account-a', status: 'IN_PROGRESS' },
    }));
  });
});
