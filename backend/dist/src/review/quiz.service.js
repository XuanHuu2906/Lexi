"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("../../generated/prisma/client");
const ai_service_1 = require("../ai/ai.service");
const prisma_service_1 = require("../prisma/prisma.service");
let QuizService = class QuizService {
    prisma;
    ai;
    constructor(prisma, ai) {
        this.prisma = prisma;
        this.ai = ai;
    }
    async generate(userId, dto) {
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
            throw new common_1.BadRequestException('Add at least 4 words to your notebook to generate a quiz');
        }
        const selected = await this.selectCycleWords(userId, pool, count);
        this.shuffle(selected);
        const words = selected.map((w) => ({ term: w.term, meaning: w.meaning }));
        const { questions } = await this.ai.generateQuiz(words);
        const quiz = await this.prisma.quizResult.create({
            data: {
                userId,
                total: questions.length,
                status: client_1.QuizStatus.IN_PROGRESS,
                questions: questions,
            },
        });
        return {
            quizId: quiz.id,
            total: questions.length,
            questions: this.clientQuestions(questions),
        };
    }
    async get(userId, id) {
        const quiz = await this.findOwned(userId, id);
        const questions = this.stored(quiz.questions);
        const completed = quiz.status === client_1.QuizStatus.COMPLETED;
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
    async saveProgress(userId, id, dto) {
        const quiz = await this.findOwned(userId, id);
        if (quiz.status === client_1.QuizStatus.COMPLETED) {
            throw new common_1.BadRequestException('Quiz already submitted');
        }
        const questions = this.stored(quiz.questions);
        questions.forEach((q, i) => {
            if (dto.answers[i] !== undefined)
                q.userAnswer = dto.answers[i];
        });
        await this.prisma.quizResult.update({
            where: { id },
            data: { questions: questions },
        });
        return { saved: true };
    }
    async submit(userId, dto) {
        const quiz = await this.findOwned(userId, dto.quizId);
        if (quiz.status === client_1.QuizStatus.COMPLETED) {
            throw new common_1.BadRequestException('Quiz already submitted');
        }
        const questions = this.stored(quiz.questions);
        let score = 0;
        const results = questions.map((q, i) => {
            const given = dto.answers[i] ?? -1;
            const correct = given === q.answerIndex;
            if (correct)
                score++;
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
                status: client_1.QuizStatus.COMPLETED,
                completedAt: new Date(),
                questions: questions,
            },
        });
        return { quizId: quiz.id, score, total: quiz.total, results };
    }
    async findOwned(userId, id) {
        const quiz = await this.prisma.quizResult.findFirst({
            where: { id, userId },
        });
        if (!quiz) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        return quiz;
    }
    stored(json) {
        return (json ?? []);
    }
    async selectCycleWords(userId, pool, count) {
        const unquizzed = pool.filter((w) => !w.quizzedInCycle);
        let selected = this.selectBySrsPriority(unquizzed, count);
        if (selected.length < count) {
            await this.prisma.word.updateMany({
                where: { userId },
                data: { quizzedInCycle: false },
            });
            const chosen = new Set(selected.map((w) => w.id));
            const remaining = pool.filter((w) => !chosen.has(w.id));
            const fill = this.selectBySrsPriority(remaining, count - selected.length);
            selected = [...selected, ...fill];
        }
        if (selected.length > 0) {
            await this.prisma.word.updateMany({
                where: { id: { in: selected.map((w) => w.id) } },
                data: { quizzedInCycle: true },
            });
        }
        return selected;
    }
    selectBySrsPriority(pool, count) {
        const now = Date.now();
        const isDue = (w) => w.srsData != null && w.srsData.nextReviewAt.getTime() <= now;
        const due = pool
            .filter(isDue)
            .sort((a, b) => a.srsData.nextReviewAt.getTime() - b.srsData.nextReviewAt.getTime());
        const hard = pool
            .filter((w) => !isDue(w) && w.srsData != null)
            .sort((a, b) => a.srsData.easeFactor - b.srsData.easeFactor);
        const rest = pool.filter((w) => w.srsData == null);
        return [...due, ...hard, ...rest].slice(0, count);
    }
    shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    clientQuestions(questions) {
        return questions.map((q, i) => ({
            index: i,
            term: q.term,
            question: q.question,
            options: q.options,
        }));
    }
};
exports.QuizService = QuizService;
exports.QuizService = QuizService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService])
], QuizService);
//# sourceMappingURL=quiz.service.js.map