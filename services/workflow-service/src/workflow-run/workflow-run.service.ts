import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkflowRunService {
  constructor(private prisma: PrismaService) {}

  async findAll(caseId?: string) {
    return this.prisma.workflowRun.findMany({
      where: caseId ? { caseId } : undefined,
      include: { template: { select: { id: true, name: true } } },
      orderBy: { startedAt: 'desc' },
    });
  }

  async findById(id: string) {
    const run = await this.prisma.workflowRun.findUnique({
      where: { id },
      include: {
        template: true,
        tasks: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!run) throw new NotFoundException(`WorkflowRun ${id} not found`);
    return run;
  }

  async create(data: { templateId: string; caseId: string }) {
    return this.prisma.workflowRun.create({
      data: {
        templateId: data.templateId,
        caseId: data.caseId,
        status: 'running',
        currentState: 'start',
        context: {},
        startedAt: new Date(),
      },
    });
  }

  async updateState(id: string, currentState: string, context?: object) {
    return this.prisma.workflowRun.update({
      where: { id },
      data: {
        currentState,
        ...(context && { context: context as any }),
      },
    });
  }

  async complete(id: string, status: 'completed' | 'failed' | 'cancelled' = 'completed') {
    return this.prisma.workflowRun.update({
      where: { id },
      data: { status, completedAt: new Date() },
    });
  }
}
