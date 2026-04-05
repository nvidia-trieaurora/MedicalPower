import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TaskService, type AssignmentInput } from './task.service';

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
  @ApiOperation({ summary: 'Create a new task with optional assignments' })
  create(@Body() body: {
    caseId: string;
    type: string;
    priority?: string;
    assignedToId?: string;
    slaDeadline?: string;
    workflowRunId?: string;
    assignments?: AssignmentInput[];
  }) {
    return this.service.create({
      caseId: body.caseId,
      type: body.type,
      priority: body.priority,
      assignedToId: body.assignedToId,
      slaDeadline: body.slaDeadline ? new Date(body.slaDeadline) : undefined,
      workflowRunId: body.workflowRunId,
      assignments: body.assignments,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID with assignments' })
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

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a task (admin/leader only)' })
  delete(@Param('id') id: string) {
    return this.service.softDelete(id);
  }
}
