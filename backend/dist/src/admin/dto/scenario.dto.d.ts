import { ScenarioDifficulty } from '../../../generated/prisma/client';
export declare class CreateScenarioDto {
    name: string;
    description: string;
    roleHint: string;
    difficulty: ScenarioDifficulty;
}
declare const UpdateScenarioDto_base: import("@nestjs/common").Type<Partial<CreateScenarioDto>>;
export declare class UpdateScenarioDto extends UpdateScenarioDto_base {
}
export declare class ListScenariosDto {
    search?: string;
    difficulty?: ScenarioDifficulty;
    status?: 'on' | 'off';
    page?: number;
    limit?: number;
}
export {};
