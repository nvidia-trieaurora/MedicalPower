import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: { userId: string; unreadOnly?: boolean; page?: number; limit?: number }) {
    const { userId, unreadOnly = false, page = 1, limit = 20 } = filters;
    const where = {
      userId,
      ...(unreadOnly && { readAt: null }),
    };

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async unreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({ where: { userId, readAt: null } });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
  }

  async markAllRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { marked: result.count };
  }

  async create(data: { userId: string; type: string; title: string; body: string; metadata?: Record<string, unknown> }) {
    return this.prisma.notification.create({
      data: { userId: data.userId, type: data.type, title: data.title, body: data.body, metadata: data.metadata as any, channel: 'in_app' },
    });
  }
}
