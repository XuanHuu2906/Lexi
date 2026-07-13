import { Injectable, NotFoundException } from '@nestjs/common';
import { ChatKind, Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatThreadDto, UpdateChatThreadDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  /** Past threads for one surface, newest activity first (no transcripts). */
  list(userId: string, kind: ChatKind) {
    return this.prisma.chatThread.findMany({
      where: { userId, kind },
      select: {
        id: true,
        kind: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /** One thread with its full transcript. */
  async get(userId: string, id: string) {
    const thread = await this.findOwned(userId, id);
    return {
      id: thread.id,
      kind: thread.kind,
      title: thread.title,
      messages: thread.messages,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
    };
  }

  /** Start a new thread from the first exchange. */
  create(userId: string, dto: CreateChatThreadDto) {
    return this.prisma.chatThread.create({
      data: {
        userId,
        kind: dto.kind,
        title: dto.title,
        messages: dto.messages as unknown as Prisma.InputJsonValue,
      },
      select: { id: true, kind: true, title: true, updatedAt: true },
    });
  }

  /** Replace a thread's transcript (and optionally its title) after a new turn. */
  async update(userId: string, id: string, dto: UpdateChatThreadDto) {
    await this.findOwned(userId, id);
    return this.prisma.chatThread.update({
      where: { id },
      data: {
        messages: dto.messages as unknown as Prisma.InputJsonValue,
        ...(dto.title ? { title: dto.title } : {}),
      },
      select: { id: true, kind: true, title: true, updatedAt: true },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOwned(userId, id);
    await this.prisma.chatThread.delete({ where: { id } });
    return { id };
  }

  private async findOwned(userId: string, id: string) {
    const thread = await this.prisma.chatThread.findFirst({
      where: { id, userId },
    });
    if (!thread) {
      throw new NotFoundException('Chat thread not found');
    }
    return thread;
  }
}
