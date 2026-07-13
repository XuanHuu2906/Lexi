import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { AiService } from '../ai/ai.service';
import { DictionaryResult } from '../ai/features/dictionary';
import { normalizeTerm } from '../common/normalize-term';
import { parseLookupTerms } from '../common/parse-lookup-terms';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWordDto } from './dto/create-word.dto';
import { GenerateExamplesDto } from './dto/generate-examples.dto';
import { ListWordsDto } from './dto/list-words.dto';
import { LookupBatchDto } from './dto/lookup-batch.dto';
import { LookupDto } from './dto/lookup.dto';
import { QuickAddDto } from './dto/quick-add.dto';
import { VerifyWordDto } from './dto/verify-word.dto';

/** One entry in a batch lookup: the AI result, or an error if that word failed. */
export interface BatchLookupItem {
  term: string;
  result: DictionaryResult | null;
  error: string | null;
}

@Injectable()
export class WordsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  /** UC04 — look up & explain a word (no persistence). */
  lookup(dto: LookupDto): Promise<DictionaryResult> {
    return this.ai.dictionary(dto.term.trim(), { level: dto.level });
  }

  /**
   * UC04 (multi) — look up several words at once. Accepts messy pasted text
   * (e.g. TOEIC answer options "(A) infinitely (B) sincerely …"), strips the
   * option labels, dedupes, and explains each word. One failed word never
   * fails the others — its item carries an `error` instead of a `result`.
   */
  async lookupBatch(dto: LookupBatchDto): Promise<{ items: BatchLookupItem[] }> {
    const terms = parseLookupTerms(dto.text);
    if (terms.length === 0) {
      throw new BadRequestException('No words found to look up');
    }

    const items = await Promise.all(
      terms.map(async (term): Promise<BatchLookupItem> => {
        try {
          const result = await this.ai.dictionary(term, { level: dto.level });
          return { term, result, error: null };
        } catch {
          return { term, result: null, error: 'Lookup failed' };
        }
      }),
    );

    return { items };
  }

  /**
   * UC21 (validate) — verify a learner's vocab entry and enrich it with full
   * dictionary data, without saving. The client shows the result: if the typed
   * meaning mismatches, it asks the user which meaning to keep before saving.
   */
  verify(dto: VerifyWordDto) {
    return this.ai.verifyVocab(dto.term.trim(), {
      userMeaning: dto.meaning?.trim() || undefined,
      level: dto.level,
    });
  }

  /** UC06 — save a word to the notebook with initial SRS data. */
  async create(userId: string, dto: CreateWordDto) {
    const term = dto.term.trim();
    const existing = await this.prisma.word.findUnique({
      where: { userId_term: { userId, term } },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('This word is already in your notebook');
    }

    return this.prisma.word.create({
      data: {
        userId,
        term,
        meaning: dto.meaning,
        phonetic: dto.phonetic,
        partOfSpeech: dto.partOfSpeech,
        examples: dto.examples ?? [],
        synonyms: dto.synonyms ?? [],
        antonyms: dto.antonyms ?? [],
        topic: dto.topic,
        note: dto.note,
        srsData: { create: {} }, // interval=1, easeFactor=2.5, nextReviewAt=now (schema defaults)
      },
      include: { srsData: true },
    });
  }

  /** UC21 — quick-add "term: meaning" + suggest TOEIC synonyms. */
  async quickAdd(userId: string, dto: QuickAddDto) {
    const idx = dto.text.indexOf(':');
    if (idx === -1) {
      throw new BadRequestException('Use the format "term: meaning"');
    }
    const term = dto.text.slice(0, idx).trim();
    const meaning = dto.text.slice(idx + 1).trim();
    if (!term || !meaning) {
      throw new BadRequestException('Use the format "term: meaning"');
    }

    // Create first so a duplicate 409s before we spend an AI call.
    const word = await this.create(userId, { term, meaning, topic: dto.topic });

    // Synonym suggestions are a bonus — never fail the save if the AI call errors.
    let synonyms: { word: string; meaning: string }[] = [];
    try {
      synonyms = (await this.ai.synonyms(term, { meaning })).synonyms;
    } catch {
      synonyms = [];
    }

    // Verify each AI suggestion against the TOEIC reference list: mark which are
    // real TOEIC-frequent words and surface those first. Also flag the term itself.
    const enrichedSynonyms = await this.markToeic(synonyms);
    const isToeicTerm = (await this.toeicTerms([term])).has(normalizeTerm(term));

    // Persist the suggested synonyms on the word so the notebook/detail modal can
    // show them later without a fresh lookup.
    let savedWord = word;
    if (enrichedSynonyms.length > 0) {
      savedWord = await this.prisma.word.update({
        where: { id: word.id },
        data: { synonyms: enrichedSynonyms.map((s) => s.word) },
        include: { srsData: true },
      });
    }

    return { word: savedWord, isToeicTerm, synonyms: enrichedSynonyms };
  }

  /** Which of the given words exist in the TOEIC reference list (normalized set). */
  private async toeicTerms(words: string[]): Promise<Set<string>> {
    const terms = [...new Set(words.map((w) => normalizeTerm(w)).filter(Boolean))];
    if (terms.length === 0) return new Set();
    const rows = await this.prisma.toeicWord.findMany({
      where: { term: { in: terms } },
      select: { term: true },
    });
    return new Set(rows.map((r) => r.term));
  }

  /** Tag each synonym with isToeic and sort TOEIC-frequent words first. */
  private async markToeic(synonyms: { word: string; meaning: string }[]) {
    const found = await this.toeicTerms(synonyms.map((s) => s.word));
    return synonyms
      .map((s) => ({ ...s, isToeic: found.has(normalizeTerm(s.word)) }))
      .sort((a, b) => Number(b.isToeic) - Number(a.isToeic));
  }

  /** List with search / topic / status filters + pagination. */
  async list(userId: string, query: ListWordsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.WordWhereInput = {
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

  async getOne(userId: string, id: string) {
    const word = await this.prisma.word.findFirst({
      where: { id, userId },
      include: {
        srsData: true,
        reviewLogs: { take: 10, orderBy: { reviewedAt: 'desc' } },
      },
    });
    if (!word) {
      throw new NotFoundException('Word not found');
    }
    return word;
  }

  async remove(userId: string, id: string) {
    const word = await this.prisma.word.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!word) {
      throw new NotFoundException('Word not found');
    }
    await this.prisma.word.delete({ where: { id } }); // cascades SrsData + ReviewLogs
    return { deleted: true };
  }

  /** UC08 — generate personalised examples and append them to the word. */
  async generateExamples(userId: string, id: string, dto: GenerateExamplesDto) {
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
}
