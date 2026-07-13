import { WordStatus } from '../../../generated/prisma/client';
export declare class ListWordsDto {
    search?: string;
    topic?: string;
    status?: WordStatus;
    sort?: 'newest' | 'oldest';
    page?: number;
    limit?: number;
}
