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
var WordsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WordsService = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("../ai/ai.service");
const normalize_term_1 = require("../common/normalize-term");
const parse_lookup_terms_1 = require("../common/parse-lookup-terms");
const prisma_service_1 = require("../prisma/prisma.service");
let WordsService = WordsService_1 = class WordsService {
    prisma;
    ai;
    logger = new common_1.Logger(WordsService_1.name);
    constructor(prisma, ai) {
        this.prisma = prisma;
        this.ai = ai;
    }
    lookup(dto) {
        return this.ai.dictionary(dto.term.trim(), { level: dto.level });
    }
    async lookupBatch(dto) {
        const terms = (0, parse_lookup_terms_1.parseLookupTerms)(dto.text);
        if (terms.length === 0) {
            throw new common_1.BadRequestException('No words found to look up');
        }
        const items = await Promise.all(terms.map(async (term) => {
            try {
                const result = await this.ai.dictionary(term, { level: dto.level });
                return { term, result, error: null };
            }
            catch {
                return { term, result: null, error: 'Lookup failed' };
            }
        }));
        return { items };
    }
    verify(dto) {
        return this.ai.verifyVocab(dto.term.trim(), {
            userMeaning: dto.meaning?.trim() || undefined,
            level: dto.level,
        });
    }
    async create(userId, dto) {
        const term = dto.term.trim();
        const existing = await this.prisma.word.findUnique({
            where: { userId_term: { userId, term } },
            select: { id: true },
        });
        if (existing) {
            throw new common_1.ConflictException('This word is already in your notebook');
        }
        let details = {};
        try {
            if (dto.enrich !== false)
                details = await this.missingDetails(dto);
        }
        catch {
            this.logger.warn('Vocabulary enrichment unavailable; saved supplied fields');
        }
        return this.prisma.word.create({
            data: {
                userId,
                term,
                meaning: dto.meaning,
                phonetic: dto.phonetic,
                partOfSpeech: dto.partOfSpeech,
                examples: details.examples ?? dto.examples ?? [],
                synonyms: details.synonyms ?? dto.synonyms ?? [],
                antonyms: details.antonyms ?? dto.antonyms ?? [],
                topic: dto.topic,
                note: dto.note,
                srsData: { create: {} },
            },
            include: { srsData: true },
        });
    }
    async missingDetails(dto) {
        const missing = (values) => !values?.some((v) => v.trim());
        if (![dto.examples, dto.synonyms, dto.antonyms].some(missing))
            return {};
        const result = await this.ai.verifyVocab(dto.term.trim(), {
            userMeaning: dto.meaning,
        });
        if (!result.isValid ||
            result.meaningVerdict !== 'match' ||
            (0, normalize_term_1.normalizeTerm)(result.correctedTerm) !== (0, normalize_term_1.normalizeTerm)(dto.term))
            return {};
        const clean = (values) => [
            ...new Set(values.map((v) => v.trim()).filter(Boolean)),
        ];
        const patch = {};
        const examples = clean(result.examples
            .filter((e) => e.en.trim() && e.vi.trim())
            .map((e) => `${e.en.trim()} — ${e.vi.trim()}`));
        const synonyms = clean(result.synonyms);
        const antonyms = clean(result.antonyms);
        if (missing(dto.examples) && examples.length)
            patch.examples = examples;
        if (missing(dto.synonyms) && synonyms.length)
            patch.synonyms = synonyms;
        if (missing(dto.antonyms) && antonyms.length)
            patch.antonyms = antonyms;
        return patch;
    }
    async enrichMissing(userId, id) {
        const word = await this.getOne(userId, id);
        const details = await this.missingDetails(word);
        if (!Object.keys(details).length)
            return { updated: false };
        const result = await this.prisma.word.updateMany({
            where: {
                id,
                userId,
                term: word.term,
                meaning: word.meaning,
                examples: { equals: word.examples },
                synonyms: { equals: word.synonyms },
                antonyms: { equals: word.antonyms },
            },
            data: details,
        });
        return { updated: result.count === 1 };
    }
    async quickAdd(userId, dto) {
        const idx = dto.text.indexOf(':');
        if (idx === -1) {
            throw new common_1.BadRequestException('Use the format "term: meaning"');
        }
        const term = dto.text.slice(0, idx).trim();
        const meaning = dto.text.slice(idx + 1).trim();
        if (!term || !meaning) {
            throw new common_1.BadRequestException('Use the format "term: meaning"');
        }
        const word = await this.create(userId, { term, meaning, topic: dto.topic });
        let synonyms = [];
        try {
            synonyms = (await this.ai.synonyms(term, { meaning })).synonyms;
        }
        catch {
            synonyms = [];
        }
        const enrichedSynonyms = await this.markToeic(synonyms);
        const isToeicTerm = (await this.toeicTerms([term])).has((0, normalize_term_1.normalizeTerm)(term));
        let savedWord = word;
        if (enrichedSynonyms.length > 0 && word.synonyms.length === 0) {
            savedWord = await this.prisma.word.update({
                where: { id: word.id },
                data: { synonyms: enrichedSynonyms.map((s) => s.word) },
                include: { srsData: true },
            });
        }
        return { word: savedWord, isToeicTerm, synonyms: enrichedSynonyms };
    }
    async toeicTerms(words) {
        const terms = [
            ...new Set(words.map((w) => (0, normalize_term_1.normalizeTerm)(w)).filter(Boolean)),
        ];
        if (terms.length === 0)
            return new Set();
        const rows = await this.prisma.toeicWord.findMany({
            where: { term: { in: terms } },
            select: { term: true },
        });
        return new Set(rows.map((r) => r.term));
    }
    async markToeic(synonyms) {
        const found = await this.toeicTerms(synonyms.map((s) => s.word));
        return synonyms
            .map((s) => ({ ...s, isToeic: found.has((0, normalize_term_1.normalizeTerm)(s.word)) }))
            .sort((a, b) => Number(b.isToeic) - Number(a.isToeic));
    }
    async list(userId, query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const where = {
            userId,
            ...(query.search
                ? { term: { contains: query.search, mode: 'insensitive' } }
                : {}),
            ...(query.topic ? { topic: query.topic } : {}),
            ...(query.status ? { status: query.status } : {}),
        };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.word.findMany({
                where,
                include: { srsData: true },
                orderBy: { createdAt: query.sort === 'oldest' ? 'asc' : 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.word.count({ where }),
        ]);
        return { items, total, page, limit };
    }
    async getOne(userId, id) {
        const word = await this.prisma.word.findFirst({
            where: { id, userId },
            include: {
                srsData: true,
                reviewLogs: { take: 10, orderBy: { reviewedAt: 'desc' } },
            },
        });
        if (!word) {
            throw new common_1.NotFoundException('Word not found');
        }
        return word;
    }
    async remove(userId, id) {
        const word = await this.prisma.word.findFirst({
            where: { id, userId },
            select: { id: true },
        });
        if (!word) {
            throw new common_1.NotFoundException('Word not found');
        }
        await this.prisma.word.delete({ where: { id } });
        return { deleted: true };
    }
    async generateExamples(userId, id, dto) {
        const word = await this.getOne(userId, id);
        const setting = await this.prisma.setting.findUnique({
            where: { userId },
            select: { topics: true },
        });
        const result = await this.ai.examples(word.term, {
            meaning: word.meaning,
            topics: setting?.topics,
            count: dto.count,
        });
        const merged = [
            ...word.examples,
            ...result.examples.map((e) => `${e.en} — ${e.vi}`),
        ];
        const updated = await this.prisma.word.update({
            where: { id },
            data: { examples: merged },
            include: { srsData: true },
        });
        return { generated: result.examples, word: updated };
    }
};
exports.WordsService = WordsService;
exports.WordsService = WordsService = WordsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService])
], WordsService);
//# sourceMappingURL=words.service.js.map