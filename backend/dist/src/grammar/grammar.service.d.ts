import { Prisma } from '../../generated/prisma/client';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGrammarDto } from './dto/create-grammar.dto';
import { GenerateGrammarExamplesDto } from './dto/generate-examples.dto';
import { ListGrammarDto } from './dto/list-grammar.dto';
import { UpdateGrammarDto } from './dto/update-grammar.dto';
export declare class GrammarService {
    private readonly prisma;
    private readonly ai;
    constructor(prisma: PrismaService, ai: AiService);
    preview(rule: string): Promise<import("../ai/features/grammar").GrammarNormalizeResult>;
    create(userId: string, dto: CreateGrammarDto): Prisma.Prisma__GrammarRuleClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        examples: string[];
        title: string | null;
        formula: string;
        explanation: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, {
        omit: Prisma.GlobalOmitConfig | undefined;
    }>;
    list(userId: string, query: ListGrammarDto): Promise<{
        items: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            examples: string[];
            title: string | null;
            formula: string;
            explanation: string;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    getOne(userId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        examples: string[];
        title: string | null;
        formula: string;
        explanation: string;
    }>;
    update(userId: string, id: string, dto: UpdateGrammarDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        examples: string[];
        title: string | null;
        formula: string;
        explanation: string;
    }>;
    remove(userId: string, id: string): Promise<{
        deleted: boolean;
    }>;
    generateExamples(userId: string, id: string, dto: GenerateGrammarExamplesDto): Promise<{
        generated: string[];
        rule: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            examples: string[];
            title: string | null;
            formula: string;
            explanation: string;
        };
    }>;
}
