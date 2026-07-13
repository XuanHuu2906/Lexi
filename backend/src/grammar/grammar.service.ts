import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGrammarDto } from './dto/create-grammar.dto';
import { GenerateGrammarExamplesDto } from './dto/generate-examples.dto';
import { ListGrammarDto } from './dto/list-grammar.dto';
import { UpdateGrammarDto } from './dto/update-grammar.dto';

@Injectable()
export class GrammarService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  /** UC20 — normalise a rough rule into formula/explanation/examples (no save). */
  preview(rule: string) {
    return this.ai.normalizeGrammar(rule.trim());
  }

  /** Save a (usually previewed & edited) grammar rule. */
  create(userId: string, dto: CreateGrammarDto) {
    return this.prisma.grammarRule.create({
      data: {
        userId,
        title: dto.title,
        formula: dto.formula,
        explanation: dto.explanation,
        examples: dto.examples ?? [],
      },
    });
  }

  async list(userId: string, query: ListGrammarDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.GrammarRuleWhereInput = {
      userId,
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { formula: { contains: query.search, mode: 'insensitive' } },
              { explanation: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.grammarRule.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.grammarRule.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async getOne(userId: string, id: string) {
    const rule = await this.prisma.grammarRule.findFirst({
      where: { id, userId },
    });
    if (!rule) {
      throw new NotFoundException('Grammar rule not found');
    }
    return rule;
  }

  async update(userId: string, id: string, dto: UpdateGrammarDto) {
    await this.getOne(userId, id); // ownership check
    return this.prisma.grammarRule.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    await this.getOne(userId, id);
    await this.prisma.grammarRule.delete({ where: { id } });
    return { deleted: true };
  }

  /** Generate additional examples for a saved rule and append them. */
  async generateExamples(
    userId: string,
    id: string,
    dto: GenerateGrammarExamplesDto,
  ) {
    const rule = await this.getOne(userId, id);
    const result = await this.ai.grammarExamples(
      rule.formula,
      rule.explanation,
      dto.count,
    );
    const updated = await this.prisma.grammarRule.update({
      where: { id },
      data: { examples: [...rule.examples, ...result.examples] },
    });
    return { generated: result.examples, rule: updated };
  }
}
