import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async getComments(taskId: string, page = 1, limit = 50) {
    const [data, total] = await Promise.all([
      this.prisma.taskComment.findMany({
        where: { taskId },
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, fullName: true, email: true } },
        },
      }),
      this.prisma.taskComment.count({ where: { taskId } }),
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async addComment(taskId: string, userId: string, message: string, type = 'text', metadata?: Record<string, unknown>) {
    const comment = await this.prisma.taskComment.create({
      data: { taskId, userId, message, type, metadata: metadata as any },
      include: { user: { select: { id: true, fullName: true, email: true } } },
    });

    this.realtime.emitChatMessage(taskId, {
      id: comment.id,
      taskId,
      message,
      type,
      userId,
      userName: comment.user.fullName,
      createdAt: comment.createdAt.toISOString(),
    });

    return comment;
  }

  async addSystemMessage(taskId: string, message: string, metadata?: Record<string, unknown>) {
    const systemUser = await this.prisma.user.findFirst({ where: { email: 'admin@medicalpower.dev' } });
    if (!systemUser) return null;

    return this.addComment(taskId, systemUser.id, message, 'status_change', metadata);
  }
}
