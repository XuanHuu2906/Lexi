import type { AuthUser } from '../auth/types/jwt-payload.type';
import { AdminScenariosService } from './admin-scenarios.service';
import { CreateScenarioDto, ListScenariosDto, UpdateScenarioDto } from './dto/scenario.dto';
export declare class AdminScenariosController {
    private readonly scenarios;
    constructor(scenarios: AdminScenariosService);
    list(query: ListScenariosDto): Promise<{
        items: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string;
            roleHint: string;
            difficulty: import("../../generated/prisma/enums").ScenarioDifficulty;
            enabled: boolean;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    create(user: AuthUser, dto: CreateScenarioDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        roleHint: string;
        difficulty: import("../../generated/prisma/enums").ScenarioDifficulty;
        enabled: boolean;
    }>;
    update(user: AuthUser, id: string, dto: UpdateScenarioDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        roleHint: string;
        difficulty: import("../../generated/prisma/enums").ScenarioDifficulty;
        enabled: boolean;
    }>;
    toggle(user: AuthUser, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        roleHint: string;
        difficulty: import("../../generated/prisma/enums").ScenarioDifficulty;
        enabled: boolean;
    }>;
    duplicate(user: AuthUser, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        roleHint: string;
        difficulty: import("../../generated/prisma/enums").ScenarioDifficulty;
        enabled: boolean;
    }>;
    remove(user: AuthUser, id: string): Promise<{
        deleted: boolean;
    }>;
}
