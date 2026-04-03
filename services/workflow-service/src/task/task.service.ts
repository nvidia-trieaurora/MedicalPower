import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStateMachine } from './task-state-machine';

@Injectable()
export class TaskService {
  constructor(
    private prisma: PrismaService,
    private stateMachine: TaskStateMachine,
  ) {}

  async findAll(filters: { assignedToId?: string; status?: string; type?: string; caseId?: string; page?: number; limit?: number }) {
    const { page = 1, limit = 20, ...where } = filters;
    const prismaWhere = {
      ...(where.assignedToId && { assignedToId: where.assignedToId }),
      ...(where.status && { status: where.status }),
      ...(where.type && { type: where.type }),
      ...(where.caseId && { caseId: where.caseId }),
    };
    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where: prismaWhere,
        orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          assignedTo: { select: { id: true, fullName: true } },
          case: {
            select: {
              id: true,
              title: true,
              patient: { select: { id: true, fullName: true, mrn: true } },
              studyLinks: {
                include: {
                  study: { select: { studyInstanceUid: true, modality: true } },
                },
              },
            },
          },
        },
      }),
      this.prisma.task.count({ where: prismaWhere }),
    ]);

    return { data: tasks, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { assignedTo: { select: { id: true, fullName: true } } },
    });
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    return task;
  }

  async create(data: { caseId: string; workflowRunId?: string; type: string; priority?: string; slaDeadline?: Date; assignedToId?: string }) {
    const status = data.assignedToId ? 'assigned' : 'created';
    return this.prisma.task.create({
      data: {
        caseId: data.caseId,
        workflowRunId: data.workflowRunId,
        type: data.type,
        status,
        priority: data.priority || 'normal',
        slaDeadline: data.slaDeadline,
        assignedToId: data.assignedToId,
        assignedAt: data.assignedToId ? new Date() : null,
      },
    });
  }

  async transition(id: string, action: string, userId?: string) {
    const task = await this.findById(id);
    const nextStatus = this.stateMachine.transition(task.status, action as any);

    const updateData: Record<string, any> = { status: nextStatus };

    if (action === 'assign' && userId) {
      updateData.assignedToId = userId;
      updateData.assignedAt = new Date();
    }
    if (action === 'start') {
      updateData.startedAt = new Date();
    }
    if (action === 'complete' || nextStatus === 'completed') {
      updateData.completedAt = new Date();
    }

    return this.prisma.task.update({ where: { id }, data: updateData });
  }

  async getAllowedActions(id: string) {
    const task = await this.findById(id);
    return {
      taskId: id,
      currentStatus: task.status,
      allowedActions: this.stateMachine.getAllowedActions(task.status),
    };
  }
}
