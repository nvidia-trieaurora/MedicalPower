import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationService } from './notification.service';

@ApiTags('notifications')
@Controller('api/v1/notifications')
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications for a user' })
  findAll(
    @Query('userId') userId: string,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAll({
      userId,
      unreadOnly: unreadOnly === 'true',
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async unreadCount(@Query('userId') userId: string) {
    const count = await this.service.unreadCount(userId);
    return { userId, unreadCount: count };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  markAsRead(@Param('id') id: string) {
    return this.service.markAsRead(id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllRead(@Query('userId') userId: string) {
    return this.service.markAllRead(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a notification' })
  create(@Body() body: { userId: string; type: string; title: string; body: string; metadata?: Record<string, unknown> }) {
    return this.service.create(body);
  }
}
