import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PermissionService } from './permission.service';

@ApiTags('permissions')
@Controller('api/v1/permissions')
export class PermissionController {
  constructor(private readonly service: PermissionService) {}

  @Get('users')
  @ApiOperation({ summary: 'List all users with their permissions' })
  listUsers() {
    return this.service.listUsersWithPermissions();
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get permissions for a user' })
  getUserPermissions(@Param('userId') userId: string) {
    return this.service.getUserPermissions(userId);
  }

  @Get('check/:userId/:permission')
  @ApiOperation({ summary: 'Check if user has a specific permission' })
  async check(@Param('userId') userId: string, @Param('permission') permission: string) {
    const has = await this.service.hasPermission(userId, permission);
    return { userId, permission, allowed: has };
  }

  @Post('grant')
  @ApiOperation({ summary: 'Grant a permission to a user' })
  async grant(@Body() body: { userId: string; permission: string; grantedById: string }) {
    const result = await this.service.grant(body.userId, body.permission, body.grantedById);
    return { granted: true, ...result };
  }

  @Post('revoke')
  @ApiOperation({ summary: 'Revoke a permission from a user' })
  async revoke(@Body() body: { userId: string; permission: string }) {
    const result = await this.service.revoke(body.userId, body.permission);
    return { revoked: !!result };
  }
}
