export declare class CreateAdminWordDto {
    word: string;
    meaning: string;
    group?: string;
}
declare const UpdateAdminWordDto_base: import("@nestjs/common").Type<Partial<CreateAdminWordDto>>;
export declare class UpdateAdminWordDto extends UpdateAdminWordDto_base {
}
export declare class ListAdminWordsDto {
    search?: string;
    group?: string;
    page?: number;
    limit?: number;
}
export declare class ImportWordsDto {
    text: string;
    commit?: boolean;
}
export {};
