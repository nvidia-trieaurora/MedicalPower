import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkflowTemplateService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId?: string) {
    return this.prisma.workflowTemplate.findMany({
      where: orgId ? { organizationId: orgId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const template = await this.prisma.workflowTemplate.findUnique({ where: { id } });
    if (!template) throw new NotFoundException(`Template ${id} not found`);
    return template;
  }

  async create(data: {
    name: string;
    description?: string;
    stateMachineDef: object;
    assignmentRules?: object;
    slaConfig?: object;
    organizationId: string;
  }) {
    return this.prisma.workflowTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        version: '1.0.0',
        stateMachineDef: data.stateMachineDef as any,
        assignmentRules: data.assignmentRules as any,
        slaConfig: data.slaConfig as any,
        organizationId: data.organizationId,
      },
    });
  }

  async update(id: string, data: { name?: string; description?: string; stateMachineDef?: object }) {
    await this.findById(id);
    return this.prisma.workflowTemplate.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.stateMachineDef && { stateMachineDef: data.stateMachineDef as any }),
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.workflowTemplate.delete({ where: { id } });
  }
}
