import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConversationStatus, Prisma } from '../../generated/prisma/client';
import { AiService } from '../ai/ai.service';
import { ConversationSummary } from '../ai/features/conversation';
import { PrismaService } from '../prisma/prisma.service';

/** One line of the stored transcript. `feedback`/`suggestion` only on AI turns. */
export interface TranscriptEntry {
  role: 'user' | 'assistant';
  content: string;
  feedback?: string;
  suggestion?: string;
}

@Injectable()
export class ConversationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  /** UC12 — start a role-play; the AI opens the conversation. */
  async start(userId: string, scenario: string) {
    const opening = await this.ai.conversationOpen(scenario);
    const transcript: TranscriptEntry[] = [
      { role: 'assistant', content: opening },
    ];
    const log = await this.prisma.conversationLog.create({
      data: {
        userId,
        scenario,
        transcript: transcript as unknown as Prisma.InputJsonValue,
        status: ConversationStatus.ACTIVE,
      },
    });
    return {
      id: log.id,
      scenario,
      status: log.status,
      opening,
    };
  }

  /** UC12 — one turn: learner message → AI reply + feedback. */
  async reply(userId: string, id: string, message: string) {
    const log = await this.findOwned(userId, id);
    if (log.status === ConversationStatus.COMPLETED) {
      throw new BadRequestException('This conversation has ended');
    }
    const transcript = this.transcript(log.transcript);
    const history = transcript.map((e) => ({
      role: e.role,
      content: e.content,
    }));

    const turn = await this.ai.conversationReply(
      log.scenario,
      history,
      message,
    );

    transcript.push({ role: 'user', content: message });
    transcript.push({
      role: 'assistant',
      content: turn.reply,
      feedback: turn.feedback,
      suggestion: turn.suggestion,
    });

    await this.prisma.conversationLog.update({
      where: { id },
      data: { transcript: transcript as unknown as Prisma.InputJsonValue },
    });

    return turn;
  }

  /** UC12 — end the role-play and produce a strengths/weaknesses summary. */
  async end(userId: string, id: string) {
    const log = await this.findOwned(userId, id);
    if (log.status === ConversationStatus.COMPLETED) {
      throw new BadRequestException('This conversation has already ended');
    }
    const transcript = this.transcript(log.transcript);
    const summary = await this.ai.conversationSummary(
      log.scenario,
      transcript.map((e) => ({ role: e.role, content: e.content })),
    );

    await this.prisma.conversationLog.update({
      where: { id },
      data: {
        status: ConversationStatus.COMPLETED,
        feedback: JSON.stringify(summary),
      },
    });

    return { summary };
  }

  async get(userId: string, id: string) {
    const log = await this.findOwned(userId, id);
    const feedback: ConversationSummary | null = log.feedback
      ? (JSON.parse(log.feedback) as ConversationSummary)
      : null;
    return {
      id: log.id,
      scenario: log.scenario,
      status: log.status,
      transcript: this.transcript(log.transcript),
      feedback,
      createdAt: log.createdAt,
    };
  }

  list(userId: string) {
    return this.prisma.conversationLog.findMany({
      where: { userId },
      select: {
        id: true,
        scenario: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async findOwned(userId: string, id: string) {
    const log = await this.prisma.conversationLog.findFirst({
      where: { id, userId },
    });
    if (!log) {
      throw new NotFoundException('Conversation not found');
    }
    return log;
  }

  private transcript(json: Prisma.JsonValue): TranscriptEntry[] {
    return (json ?? []) as unknown as TranscriptEntry[];
  }
}
