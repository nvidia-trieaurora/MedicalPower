import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_PERMISSIONS: Record<string, string[]> = {
  system_admin: ['admin_panel', 'view_all_tasks', 'create_case', 'review', 'workflow_builder'],
  org_admin: ['admin_panel', 'view_all_tasks', 'create_case', 'review', 'workflow_builder'],
  clinical_lead: ['create_case', 'review', 'workflow_builder', 'view_all_tasks'],
  radiologist: ['review', 'diagnose'],
  annotator: ['annotate'],
  qa_reviewer: ['review'],
  data_scientist: ['view_all_tasks'],
  viewer: [],
};

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}

  getDefaultPermissions(roleName: string): string[] {
    return DEFAULT_PERMISSIONS[roleName] || [];
  }

  async getEffectivePermissions(userId: string): Promise<string[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: true } } },
    });
    if (!user) return [];

    const roleNames = user.roles.map((ur) => ur.role.name);
    const defaults = new Set<string>(roleNames.flatMap((r) => this.getDefaultPermissions(r)));

    const grants = await this.prisma.userPermission.findMany({
      where: { userId, revokedAt: null },
    });
    grants.forEach((g) => defaults.add(g.permission));

    return Array.from(defaults);
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const perms = await this.getEffectivePermissions(userId);
    return perms.includes(permission);
  }

  async getUserPermissions(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: true } } },
    });
    if (!user) return { defaults: [], granted: [], effective: [] };

    const roleNames = user.roles.map((ur) => ur.role.name);
    const defaults = Array.from(new Set<string>(roleNames.flatMap((r) => this.getDefaultPermissions(r))));

    const grants = await this.prisma.userPermission.findMany({
      where: { userId, revokedAt: null },
      select: { permission: true, grantedAt: true, grantedBy: { select: { id: true, fullName: true } } },
    });
    const granted = grants.map((g) => g.permission);

    const effective = Array.from(new Set<string>([...defaults, ...granted]));

    return { defaults, granted, effective, grants };
  }

  async grant(userId: string, permission: string, grantedById: string) {
    const existing = await this.prisma.userPermission.findUnique({
      where: { userId_permission: { userId, permission } },
    });

    if (existing && !existing.revokedAt) return existing;

    if (existing) {
      return this.prisma.userPermission.update({
        where: { id: existing.id },
        data: { revokedAt: null, grantedById, grantedAt: new Date() },
      });
    }

    return this.prisma.userPermission.create({
      data: { userId, permission, grantedById },
    });
  }

  async revoke(userId: string, permission: string) {
    const existing = await this.prisma.userPermission.findUnique({
      where: { userId_permission: { userId, permission } },
    });
    if (!existing || existing.revokedAt) return null;

    return this.prisma.userPermission.update({
      where: { id: existing.id },
      data: { revokedAt: new Date() },
    });
  }

  async listUsersWithPermissions() {
    const users = await this.prisma.user.findMany({
      where: { status: 'active' },
      include: {
        roles: { include: { role: { select: { name: true } } } },
        permissions: {
          where: { revokedAt: null },
          select: { permission: true, grantedAt: true },
        },
      },
      orderBy: { fullName: 'asc' },
    });

    return users.map((u) => {
      const roleNames = u.roles.map((ur) => ur.role.name);
      const defaults = Array.from(new Set<string>(roleNames.flatMap((r) => this.getDefaultPermissions(r))));
      const granted = u.permissions.map((p) => p.permission);
      return {
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        roles: roleNames,
        defaults,
        granted,
        effective: Array.from(new Set<string>([...defaults, ...granted])),
      };
    });
  }
}
