import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const caseListInclude = {
  patient: { select: { id: true, fullName: true, mrn: true } },
  studyLinks: {
    include: {
      study: {
        select: {
          id: true,
          studyInstanceUid: true,
          modality: true,
          description: true,
          studyDate: true,
          numInstances: true,
        },
      },
    },
  },
  _count: { select: { tasks: true } },
};

const caseDetailInclude = {
  patient: true,
  studyLinks: { include: { study: true } },
  tasks: {
    include: {
      assignedTo: { select: { id: true, fullName: true, email: true } },
    },
  },
  createdBy: { select: { id: true, fullName: true, email: true } },
};

@Injectable()
export class CaseService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: {
    search?: string;
    status?: string;
    priority?: string;
    patientId?: string;
    page?: number;
    limit?: number;
  }) {
    const { page = 1, limit = 20, search, status, priority, patientId } = filters;
    const where = {
      deletedAt: null,
      ...(status && { status }),
      ...(priority && { priority }),
      ...(patientId && { patientId }),
      ...(search && {
        title: { contains: search, mode: 'insensitive' as const },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.case.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: caseListInclude,
      }),
      this.prisma.case.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 0;

    return {
      data,
      meta: { page, limit, total, totalPages },
    };
  }

  async findOne(id: string) {
    const row = await this.prisma.case.findFirst({
      where: { id, deletedAt: null },
      include: caseDetailInclude,
    });
    if (!row) throw new NotFoundException(`Case ${id} not found`);
    return row;
  }

  async create(body: {
    title: string;
    description?: string;
    patientId: string;
    organizationId: string;
    priority?: string;
    createdById: string;
    slaDeadline?: string | Date;
    studyIds?: string[];
  }) {
    const slaDeadline =
      body.slaDeadline === undefined || body.slaDeadline === null
        ? undefined
        : typeof body.slaDeadline === 'string'
          ? new Date(body.slaDeadline)
          : body.slaDeadline;

    const studyIds = body.studyIds?.length ? [...new Set(body.studyIds)] : [];

    const created = await this.prisma.$transaction(async (tx) => {
      const c = await tx.case.create({
        data: {
          title: body.title,
          description: body.description,
          patientId: body.patientId,
          organizationId: body.organizationId,
          priority: body.priority ?? 'normal',
          createdById: body.createdById,
          slaDeadline,
        },
      });

      if (studyIds.length) {
        await tx.caseStudyLink.createMany({
          data: studyIds.map((studyId) => ({
            caseId: c.id,
            studyId,
          })),
          skipDuplicates: true,
        });
      }

      return c;
    });

    return this.findOne(created.id);
  }

  async update(
    id: string,
    body: Partial<{
      title: string;
      description: string | null;
      patientId: string;
      organizationId: string;
      priority: string;
      status: string;
      assignedTo: string | null;
      assignedGroup: string | null;
      slaDeadline: string | Date | null;
      metadata: unknown;
    }>,
  ) {
    await this.ensureExists(id);

    const data: Record<string, unknown> = {};

    if (body.title !== undefined) data.title = body.title;
    if (body.description !== undefined) data.description = body.description;
    if (body.patientId !== undefined) data.patientId = body.patientId;
    if (body.organizationId !== undefined) data.organizationId = body.organizationId;
    if (body.priority !== undefined) data.priority = body.priority;
    if (body.status !== undefined) data.status = body.status;
    if (body.assignedTo !== undefined) data.assignedTo = body.assignedTo;
    if (body.assignedGroup !== undefined) data.assignedGroup = body.assignedGroup;
    if (body.metadata !== undefined) data.metadata = body.metadata;

    if (body.slaDeadline !== undefined) {
      if (body.slaDeadline === null) {
        data.slaDeadline = null;
      } else {
        data.slaDeadline =
          typeof body.slaDeadline === 'string' ? new Date(body.slaDeadline) : body.slaDeadline;
      }
    }

    await this.prisma.case.update({
      where: { id },
      data,
    });

    return this.findOne(id);
  }

  async softDelete(id: string) {
    await this.ensureExists(id);
    await this.prisma.case.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { id, deleted: true };
  }

  async getDashboardStats() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalPatients,
      totalCases,
      activeTasks,
      completedToday,
      pendingReview,
      slaAtRisk,
    ] = await Promise.all([
      this.prisma.patient.count({ where: { deletedAt: null } }),
      this.prisma.case.count({ where: { deletedAt: null } }),
      this.prisma.task.count({
        where: {
          status: { notIn: ['completed', 'approved', 'rejected'] },
        },
      }),
      this.prisma.task.count({
        where: {
          completedAt: { gte: startOfDay },
          status: 'completed',
        },
      }),
      this.prisma.task.count({
        where: {
          status: { in: ['in_review', 'submitted'] },
        },
      }),
      this.prisma.case.count({
        where: {
          deletedAt: null,
          slaDeadline: { lt: now },
          status: { notIn: ['completed', 'closed'] },
        },
      }),
    ]);

    return {
      totalPatients,
      totalCases,
      activeTasks,
      completedToday,
      pendingReview,
      slaAtRisk,
    };
  }

  private async ensureExists(id: string) {
    const row = await this.prisma.case.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    if (!row) throw new NotFoundException(`Case ${id} not found`);
  }
}
