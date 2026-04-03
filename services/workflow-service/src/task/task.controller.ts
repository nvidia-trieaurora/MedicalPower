import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TaskService } from './task.service';

@ApiTags('tasks')
@Controller('api/v1/tasks')
export class TaskController {
  constructor(private readonly service: TaskService) {}

  @Get()
  @ApiOperation({ summary: 'List tasks with filters and pagination' })
  findAll(
    @Query('assignedToId') assignedToId?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('caseId') caseId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAll({
      assignedToId,
      status,
      type,
      caseId,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  create(@Body() body: { caseId: string; type: string; priority?: string; assignedToId?: string; slaDeadline?: string; workflowRunId?: string }) {
    return this.service.create({
      caseId: body.caseId,
      type: body.type,
      priority: body.priority,
      assignedToId: body.assignedToId,
      slaDeadline: body.slaDeadline ? new Date(body.slaDeadline) : undefined,
      workflowRunId: body.workflowRunId,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Get(':id/actions')
  @ApiOperation({ summary: 'Get allowed state transitions for a task' })
  getAllowedActions(@Param('id') id: string) {
    return this.service.getAllowedActions(id);
  }

  @Patch(':id/transition')
  @ApiOperation({ summary: 'Advance task state' })
  transition(
    @Param('id') id: string,
    @Body() body: { action: string; userId?: string },
  ) {
    return this.service.transition(id, body.action, body.userId);
  }
}
