import type { AuthUser } from '../auth/types/jwt-payload.type';
import { AdminWordsService } from './admin-words.service';
import { CreateAdminWordDto, ImportWordsDto, ListAdminWordsDto, UpdateAdminWordDto } from './dto/word.dto';
export declare class AdminWordsController {
    private readonly words;
    constructor(words: AdminWordsService);
    list(query: ListAdminWordsDto): Promise<{
        items: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            pos: string | null;
            ipa: string | null;
            meaning: string | null;
            term: string;
            display: string | null;
            group: string | null;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    create(user: AuthUser, dto: CreateAdminWordDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        pos: string | null;
        ipa: string | null;
        meaning: string | null;
        term: string;
        display: string | null;
        group: string | null;
    }>;
    import(user: AuthUser, dto: ImportWordsDto): Promise<{
        rows: import("./admin-words.service").CsvRow[];
        added: number;
        skipped: number;
        committed: boolean;
    }>;
    export(user: AuthUser): Promise<{
        csv: string;
        count: number;
    }>;
    update(user: AuthUser, id: string, dto: UpdateAdminWordDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        pos: string | null;
        ipa: string | null;
        meaning: string | null;
        term: string;
        display: string | null;
        group: string | null;
    }>;
    remove(user: AuthUser, id: string): Promise<{
        deleted: boolean;
    }>;
}
