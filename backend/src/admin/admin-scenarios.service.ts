import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditActor, AuditService } from './audit.service';
import {
  CreateScenarioDto,
  ListScenariosDto,
  UpdateScenarioDto,
} from './dto/scenario.dto';

@Injectable()
export class AdminScenariosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(query: ListScenariosDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 7;

    const where: Prisma.ConversationScenarioWhereInput = {
      ...(query.difficulty ? { difficulty: query.difficulty } : {}),
      ...(query.status ? { enabled: query.status === 'on' } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.conversationScenario.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.conversationScenario.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async create(actor: AuditActor, dto: CreateScenarioDto) {
    const name = dto.name.trim();
    await this.ensureUniqueName(name);
    const row = await this.prisma.conversationScenario.create({
      data: {
        name,
        description: dto.description.trim(),
        roleHint: dto.roleHint.trim(),
        difficulty: dto.difficulty,
      },
    });
    await this.audit.log(actor, {
      action: 'CREATE',
      target: `Tình huống: ${name}`,
    });
    return row;
  }

  async update(actor: AuditActor, id: string, dto: UpdateScenarioDto) {
    const existing = await this.getOrThrow(id);

    const data: Prisma.ConversationScenarioUpdateInput = {};
    if (dto.name !== undefined) {
      const name = dto.name.trim();
      if (name.toLowerCase() !== existing.name.toLowerCase())
        await this.ensureUniqueName(name);
      data.name = name;
    }
    if (dto.description !== undefined) data.description = dto.description.trim();
    if (dto.roleHint !== undefined) data.roleHint = dto.roleHint.trim();
    if (dto.difficulty !== undefined) data.difficulty = dto.difficulty;

    const row = await this.prisma.conversationScenario.update({
      where: { id },
      data,
    });
    await this.audit.log(actor, {
      action: 'UPDATE',
      target: `Tình huống: ${row.name}`,
    });
    return row;
  }

  async remove(actor: AuditActor, id: string) {
    const existing = await this.getOrThrow(id);
    await this.prisma.conversationScenario.delete({ where: { id } });
    await this.audit.log(actor, {
      action: 'DELETE',
      target: `Tình huống: ${existing.name}`,
    });
    return { deleted: true };
  }

  async toggle(actor: AuditActor, id: string) {
    const existing = await this.getOrThrow(id);
    const enabled = !existing.enabled;
    const row = await this.prisma.conversationScenario.update({
      where: { id },
      data: { enabled },
    });
    await this.audit.log(actor, {
      action: 'TOGGLE',
      target: `Tình huống: ${existing.name}`,
      before: existing.enabled ? 'Hiển thị' : 'Đã ẩn',
      after: enabled ? 'Hiển thị' : 'Đã ẩn',
    });
    return row;
  }

  async duplicate(actor: AuditActor, id: string) {
    const existing = await this.getOrThrow(id);
    // Find a free "(bản sao)" name so duplicating twice doesn't collide.
    let name = `${existing.name} (bản sao)`;
    for (let n = 2; await this.nameTaken(name); n++) {
      name = `${existing.name} (bản sao ${n})`;
    }
    const row = await this.prisma.conversationScenario.create({
      data: {
        name,
        description: existing.description,
        roleHint: existing.roleHint,
        difficulty: existing.difficulty,
        enabled: false, // duplicates start hidden
      },
    });
    await this.audit.log(actor, {
      action: 'CREATE',
      target: `Tình huống: ${name}`,
    });
    return row;
  }

  private async ensureUniqueName(name: string) {
    if (await this.nameTaken(name)) {
      throw new ConflictException(`Tình huống "${name}" đã tồn tại.`);
    }
  }

  private async nameTaken(name: string): Promise<boolean> {
    const row = await this.prisma.conversationScenario.findUnique({
      where: { name },
      select: { id: true },
    });
    return !!row;
  }

  private async getOrThrow(id: string) {
    const row = await this.prisma.conversationScenario.findUnique({
      where: { id },
    });
    if (!row) throw new NotFoundException('Không tìm thấy tình huống.');
    return row;
  }
}
