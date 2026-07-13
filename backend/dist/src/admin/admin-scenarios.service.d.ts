import { PrismaService } from '../prisma/prisma.service';
import { AuditActor, AuditService } from './audit.service';
import { CreateScenarioDto, ListScenariosDto, UpdateScenarioDto } from './dto/scenario.dto';
export declare class AdminScenariosService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
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
    create(actor: AuditActor, dto: CreateScenarioDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        roleHint: string;
        difficulty: import("../../generated/prisma/enums").ScenarioDifficulty;
        enabled: boolean;
    }>;
    update(actor: AuditActor, id: string, dto: UpdateScenarioDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        roleHint: string;
        difficulty: import("../../generated/prisma/enums").ScenarioDifficulty;
        enabled: boolean;
    }>;
    remove(actor: AuditActor, id: string): Promise<{
        deleted: boolean;
    }>;
    toggle(actor: AuditActor, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        roleHint: string;
        difficulty: import("../../generated/prisma/enums").ScenarioDifficulty;
        enabled: boolean;
    }>;
    duplicate(actor: AuditActor, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        roleHint: string;
        difficulty: import("../../generated/prisma/enums").ScenarioDifficulty;
        enabled: boolean;
    }>;
    private ensureUniqueName;
    private nameTaken;
    private getOrThrow;
}
