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
exports.ReviewService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("../../generated/prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const answer_dto_1 = require("./dto/answer.dto");
const sm2_1 = require("./sm2");
let ReviewService = class ReviewService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async due(userId, limit = 20) {
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
    async answer(userId, dto) {
        const quality = answer_dto_1.RATING_QUALITY[dto.rating];
        const word = await this.prisma.word.findFirst({
            where: { id: dto.wordId, userId },
            include: { srsData: true },
        });
        if (!word || !word.srsData) {
            throw new common_1.NotFoundException('Word not found');
        }
        const now = new Date();
        const next = (0, sm2_1.sm2)({
            interval: word.srsData.interval,
            easeFactor: word.srsData.easeFactor,
            repetitions: word.srsData.repetitions,
        }, quality, now);
        const status = next.interval >= 21 ? client_1.WordStatus.MASTERED : client_1.WordStatus.LEARNING;
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
    async flashcards(userId, mode = 'guess', limit = 10, scope = 'due') {
        const pool = await this.prisma.word.findMany({
            where: { userId },
            include: { srsData: true },
            orderBy: [{ srsData: { nextReviewAt: 'asc' } }, { createdAt: 'desc' }],
            take: Math.max(limit, 20),
        });
        if (pool.length === 0) {
            throw new common_1.BadRequestException('You have no saved words to review yet');
        }
        let selected = pool.slice(0, limit);
        let servedScope = 'due';
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
            throw new common_1.BadRequestException('Need at least 4 words for match mode');
        }
        const meanings = Array.from(new Set([...pool, ...selected].map((w) => w.meaning)));
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
            return base;
        });
        return { mode, scope: servedScope, count: cards.length, cards };
    }
    buildOptions(correct, pool) {
        const distractors = this.shuffle(pool.filter((m) => m !== correct)).slice(0, 3);
        const options = this.shuffle([correct, ...distractors]);
        return { options, answerIndex: options.indexOf(correct) };
    }
    buildCloze(term, examples) {
        const re = new RegExp(this.escapeRegExp(term), 'i');
        const hit = examples.find((e) => re.test(e));
        return hit ? hit.replace(re, '_____') : null;
    }
    shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
    escapeRegExp(s) {
        return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
};
exports.ReviewService = ReviewService;
exports.ReviewService = ReviewService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewService);
const DAY_MS = 24 * 60 * 60 * 1000;
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;
function startOfTodayVN() {
    const vnNow = Date.now() + VN_OFFSET_MS;
    const vnMidnight = Math.floor(vnNow / DAY_MS) * DAY_MS;
    return new Date(vnMidnight - VN_OFFSET_MS);
}
//# sourceMappingURL=review.service.js.map