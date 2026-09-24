import { PrismaService } from '../prisma/prisma.service';
import { AuditActor, AuditService } from './audit.service';
import { CreateAdminWordDto, ImportWordsDto, ListAdminWordsDto, UpdateAdminWordDto } from './dto/word.dto';
export interface CsvRow {
    line: number;
    raw: string;
    word: string;
    meaning: string;
    group: string;
    ok: boolean;
    err: string;
}
export declare class AdminWordsService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    list(query: ListAdminWordsDto): Promise<{
        items: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            term: string;
            meaning: string | null;
            display: string | null;
            pos: string | null;
            ipa: string | null;
            group: string | null;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    create(actor: AuditActor, dto: CreateAdminWordDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        term: string;
        meaning: string | null;
        display: string | null;
        pos: string | null;
        ipa: string | null;
        group: string | null;
    }>;
    update(actor: AuditActor, id: string, dto: UpdateAdminWordDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        term: string;
        meaning: string | null;
        display: string | null;
        pos: string | null;
        ipa: string | null;
        group: string | null;
    }>;
    remove(actor: AuditActor, id: string): Promise<{
        deleted: boolean;
    }>;
    import(actor: AuditActor, dto: ImportWordsDto): Promise<{
        rows: CsvRow[];
        added: number;
        skipped: number;
        committed: boolean;
    }>;
    export(actor: AuditActor): Promise<{
        csv: string;
        count: number;
    }>;
    private parse;
    private ensureUnique;
    private getOrThrow;
}
