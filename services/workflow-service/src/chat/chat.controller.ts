import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ChatService } from './chat.service';

@ApiTags('chat')
@Controller('api/v1/tasks')
export class ChatController {
  constructor(private readonly service: ChatService) {}

  @Get(':taskId/comments')
  @ApiOperation({ summary: 'Get comments for a task' })
  getComments(
    @Param('taskId') taskId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getComments(taskId, page ? parseInt(page, 10) : undefined, limit ? parseInt(limit, 10) : undefined);
  }

  @Post(':taskId/comments')
  @ApiOperation({ summary: 'Add a comment to a task' })
  addComment(
    @Param('taskId') taskId: string,
    @Body() body: { userId: string; message: string; type?: string; metadata?: Record<string, unknown> },
  ) {
    return this.service.addComment(taskId, body.userId, body.message, body.type, body.metadata);
  }
}
