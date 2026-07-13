import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { normalizeTerm } from '../common/normalize-term';
import { PrismaService } from '../prisma/prisma.service';
import { AuditActor, AuditService } from './audit.service';
import {
  CreateAdminWordDto,
  ImportWordsDto,
  ListAdminWordsDto,
  UpdateAdminWordDto,
} from './dto/word.dto';

export interface CsvRow {
  line: number;
  raw: string;
  word: string;
  meaning: string;
  group: string;
  ok: boolean;
  err: string;
}

@Injectable()
export class AdminWordsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(query: ListAdminWordsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 7;

    const where: Prisma.ToeicWordWhereInput = {
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

  async create(actor: AuditActor, dto: CreateAdminWordDto) {
    const word = dto.word.trim();
    const term = normalizeTerm(word);
    if (!term) {
      throw new ConflictException('Từ không hợp lệ.');
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

  async update(actor: AuditActor, id: string, dto: UpdateAdminWordDto) {
    const existing = await this.getOrThrow(id);

    const data: Prisma.ToeicWordUpdateInput = {};
    if (dto.word !== undefined) {
      const word = dto.word.trim();
      const term = normalizeTerm(word);
      if (!term) throw new ConflictException('Từ không hợp lệ.');
      if (term !== existing.term) await this.ensureUnique(term);
      data.term = term;
      data.display = word;
    }
    if (dto.meaning !== undefined) data.meaning = dto.meaning.trim();
    if (dto.group !== undefined) data.group = dto.group.trim() || null;

    const row = await this.prisma.toeicWord.update({ where: { id }, data });
    await this.audit.log(actor, {
      action: 'UPDATE',
      target: `Từ: ${row.display ?? row.term}`,
      before: `${existing.display ?? existing.term} — ${existing.meaning ?? ''}`,
      after: `${row.display ?? row.term} — ${row.meaning ?? ''}`,
    });
    return row;
  }

  async remove(actor: AuditActor, id: string) {
    const existing = await this.getOrThrow(id);
    await this.prisma.toeicWord.delete({ where: { id } });
    await this.audit.log(actor, {
      action: 'DELETE',
      target: `Từ: ${existing.display ?? existing.term}`,
      before: `${existing.display ?? existing.term} — ${existing.meaning ?? ''}`,
    });
    return { deleted: true };
  }

  /** Parse CSV, validate every row, and (when commit) persist valid rows. */
  async import(actor: AuditActor, dto: ImportWordsDto) {
    const commit = dto.commit ?? true;
    const rows = await this.parse(dto.text);
    const valid = rows.filter((r) => r.ok);

    if (commit && valid.length) {
      await this.prisma.toeicWord.createMany({
        data: valid.map((r) => ({
          term: normalizeTerm(r.word),
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

  /** Export the whole list as CSV text ("word;meaning;group"). */
  async export(actor: AuditActor) {
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

  private async parse(text: string): Promise<CsvRow[]> {
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length);

    // One query for all existing terms referenced in the file.
    const candidates = [
      ...new Set(
        lines
          .map((l) => normalizeTerm(l.split(/[;,\t]/)[0] ?? ''))
          .filter(Boolean),
      ),
    ];
    const existingRows = candidates.length
      ? await this.prisma.toeicWord.findMany({
          where: { term: { in: candidates } },
          select: { term: true },
        })
      : [];
    const existing = new Set(existingRows.map((r) => r.term));
    const seen = new Set<string>();

    return lines.map((line, i) => {
      const parts = line.split(/[;,\t]/).map((p) => p.trim());
      const word = parts[0] || '';
      const meaning = parts[1] || '';
      const group = parts[2] || '';
      const term = normalizeTerm(word);
      let ok = true;
      let err = '';
      if (!word || !meaning) {
        ok = false;
        err = 'Thiếu từ/nghĩa';
      } else if (existing.has(term)) {
        ok = false;
        err = 'Đã có trong list';
      } else if (seen.has(term)) {
        ok = false;
        err = 'Trùng trong file';
      }
      if (ok) seen.add(term);
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

  private async ensureUnique(term: string) {
    const dup = await this.prisma.toeicWord.findUnique({
      where: { term },
      select: { id: true },
    });
    if (dup) {
      throw new ConflictException(`Từ "${term}" đã tồn tại trong danh sách.`);
    }
  }

  private async getOrThrow(id: string) {
    const row = await this.prisma.toeicWord.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Không tìm thấy từ.');
    return row;
  }
}
