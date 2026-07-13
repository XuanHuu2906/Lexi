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
exports.AdminWordsService = void 0;
const common_1 = require("@nestjs/common");
const normalize_term_1 = require("../common/normalize-term");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("./audit.service");
let AdminWordsService = class AdminWordsService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async list(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 7;
        const where = {
            ...(query.group ? { group: query.group } : {}),
            ...(query.search
                ? {
                    OR: [
                        { display: { contains: query.search, mode: 'insensitive' } },
                        { term: { contains: query.search, mode: 'insensitive' } },
                        { meaning: { contains: query.search, mode: 'insensitive' } },
                    ],
                }
                : {}),
        };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.toeicWord.findMany({
                where,
                orderBy: { updatedAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.toeicWord.count({ where }),
        ]);
        return { items, total, page, limit };
    }
    async create(actor, dto) {
        const word = dto.word.trim();
        const term = (0, normalize_term_1.normalizeTerm)(word);
        if (!term) {
            throw new common_1.ConflictException('Từ không hợp lệ.');
        }
        await this.ensureUnique(term);
        const row = await this.prisma.toeicWord.create({
            data: {
                term,
                display: word,
                meaning: dto.meaning.trim(),
                group: dto.group?.trim() || null,
            },
        });
        await this.audit.log(actor, {
            action: 'CREATE',
            target: `Từ: ${word}`,
            after: `${word} — ${row.meaning ?? ''}`,
        });
        return row;
    }
    async update(actor, id, dto) {
        const existing = await this.getOrThrow(id);
        const data = {};
        if (dto.word !== undefined) {
            const word = dto.word.trim();
            const term = (0, normalize_term_1.normalizeTerm)(word);
            if (!term)
                throw new common_1.ConflictException('Từ không hợp lệ.');
            if (term !== existing.term)
                await this.ensureUnique(term);
            data.term = term;
            data.display = word;
        }
        if (dto.meaning !== undefined)
            data.meaning = dto.meaning.trim();
        if (dto.group !== undefined)
            data.group = dto.group.trim() || null;
        const row = await this.prisma.toeicWord.update({ where: { id }, data });
        await this.audit.log(actor, {
            action: 'UPDATE',
            target: `Từ: ${row.display ?? row.term}`,
            before: `${existing.display ?? existing.term} — ${existing.meaning ?? ''}`,
            after: `${row.display ?? row.term} — ${row.meaning ?? ''}`,
        });
        return row;
    }
    async remove(actor, id) {
        const existing = await this.getOrThrow(id);
        await this.prisma.toeicWord.delete({ where: { id } });
        await this.audit.log(actor, {
            action: 'DELETE',
            target: `Từ: ${existing.display ?? existing.term}`,
            before: `${existing.display ?? existing.term} — ${existing.meaning ?? ''}`,
        });
        return { deleted: true };
    }
    async import(actor, dto) {
        const commit = dto.commit ?? true;
        const rows = await this.parse(dto.text);
        const valid = rows.filter((r) => r.ok);
        if (commit && valid.length) {
            await this.prisma.toeicWord.createMany({
                data: valid.map((r) => ({
                    term: (0, normalize_term_1.normalizeTerm)(r.word),
                    display: r.word,
                    meaning: r.meaning,
                    group: r.group,
                })),
                skipDuplicates: true,
            });
            await this.audit.log(actor, {
                action: 'IMPORT',
                target: `Word list (+${valid.length} từ)`,
                after: `${valid.length} từ mới`,
            });
        }
        return {
            rows,
            added: commit ? valid.length : 0,
            skipped: rows.length - valid.length,
            committed: commit && valid.length > 0,
        };
    }
    async export(actor) {
        const rows = await this.prisma.toeicWord.findMany({
            orderBy: { updatedAt: 'desc' },
        });
        const csv = rows
            .map((r) => `${r.display ?? r.term};${r.meaning ?? ''};${r.group ?? ''}`)
            .join('\n');
        await this.audit.log(actor, {
            action: 'EXPORT',
            target: `Xuất Word list (${rows.length} từ)`,
        });
        return { csv, count: rows.length };
    }
    async parse(text) {
        const lines = text
            .split('\n')
            .map((l) => l.trim())
            .filter((l) => l.length);
        const candidates = [
            ...new Set(lines
                .map((l) => (0, normalize_term_1.normalizeTerm)(l.split(/[;,\t]/)[0] ?? ''))
                .filter(Boolean)),
        ];
        const existingRows = candidates.length
            ? await this.prisma.toeicWord.findMany({
                where: { term: { in: candidates } },
                select: { term: true },
            })
            : [];
        const existing = new Set(existingRows.map((r) => r.term));
        const seen = new Set();
        return lines.map((line, i) => {
            const parts = line.split(/[;,\t]/).map((p) => p.trim());
            const word = parts[0] || '';
            const meaning = parts[1] || '';
            const group = parts[2] || '';
            const term = (0, normalize_term_1.normalizeTerm)(word);
            let ok = true;
            let err = '';
            if (!word || !meaning) {
                ok = false;
                err = 'Thiếu từ/nghĩa';
            }
            else if (existing.has(term)) {
                ok = false;
                err = 'Đã có trong list';
            }
            else if (seen.has(term)) {
                ok = false;
                err = 'Trùng trong file';
            }
            if (ok)
                seen.add(term);
            return {
                line: i + 1,
                raw: line,
                word,
                meaning,
                group: group || 'Chưa phân nhóm',
                ok,
                err,
            };
        });
    }
    async ensureUnique(term) {
        const dup = await this.prisma.toeicWord.findUnique({
            where: { term },
            select: { id: true },
        });
        if (dup) {
            throw new common_1.ConflictException(`Từ "${term}" đã tồn tại trong danh sách.`);
        }
    }
    async getOrThrow(id) {
        const row = await this.prisma.toeicWord.findUnique({ where: { id } });
        if (!row)
            throw new common_1.NotFoundException('Không tìm thấy từ.');
        return row;
    }
};
exports.AdminWordsService = AdminWordsService;
exports.AdminWordsService = AdminWordsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], AdminWordsService);
//# sourceMappingURL=admin-words.service.js.map