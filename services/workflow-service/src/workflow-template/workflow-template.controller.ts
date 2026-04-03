import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WorkflowTemplateService } from './workflow-template.service';

@ApiTags('workflow-templates')
@Controller('api/v1/workflow-templates')
export class WorkflowTemplateController {
  constructor(private readonly service: WorkflowTemplateService) {}

  @Get()
  @ApiOperation({ summary: 'List all workflow templates' })
  findAll(@Query('orgId') orgId?: string) {
    return this.service.findAll(orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template by ID' })
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create workflow template' })
  create(@Body() body: { name: string; description?: string; stateMachineDef: object; organizationId: string }) {
    return this.service.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update workflow template' })
  update(@Param('id') id: string, @Body() body: { name?: string; description?: string; stateMachineDef?: object }) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete workflow template' })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
