import { CreateGrammarDto } from './dto/create-grammar.dto';
import { GenerateGrammarExamplesDto } from './dto/generate-examples.dto';
import { ListGrammarDto } from './dto/list-grammar.dto';
import { PreviewGrammarDto } from './dto/preview-grammar.dto';
import { UpdateGrammarDto } from './dto/update-grammar.dto';
import { GrammarService } from './grammar.service';
export declare class GrammarController {
    private readonly grammarService;
    constructor(grammarService: GrammarService);
    preview(dto: PreviewGrammarDto): Promise<import("../ai/features/grammar").GrammarNormalizeResult>;
    create(userId: string, dto: CreateGrammarDto): import("../../generated/prisma/models").Prisma__GrammarRuleClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        examples: string[];
        title: string | null;
        userId: string;
        formula: string;
        explanation: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, {
        omit: import("../../generated/prisma/internal/prismaNamespace").GlobalOmitConfig | undefined;
    }>;
    list(userId: string, query: ListGrammarDto): Promise<{
        items: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            examples: string[];
            title: string | null;
            userId: string;
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
        examples: string[];
        title: string | null;
        userId: string;
        formula: string;
        explanation: string;
    }>;
    update(userId: string, id: string, dto: UpdateGrammarDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        examples: string[];
        title: string | null;
        userId: string;
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
            examples: string[];
            title: string | null;
            userId: string;
            formula: string;
            explanation: string;
        };
    }>;
}
