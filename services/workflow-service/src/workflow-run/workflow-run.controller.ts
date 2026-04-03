import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WorkflowRunService } from './workflow-run.service';

@ApiTags('workflow-runs')
@Controller('api/v1/workflow-runs')
export class WorkflowRunController {
  constructor(private readonly service: WorkflowRunService) {}

  @Get()
  @ApiOperation({ summary: 'List workflow runs' })
  findAll(@Query('caseId') caseId?: string) {
    return this.service.findAll(caseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workflow run with tasks' })
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Start a new workflow run for a case' })
  create(@Body() body: { templateId: string; caseId: string }) {
    return this.service.create(body);
  }
}
