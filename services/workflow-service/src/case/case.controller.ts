import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CaseService } from './case.service';

@ApiTags('cases')
@Controller('api/v1/cases')
export class CaseController {
  constructor(private readonly service: CaseService) {}

  @Get()
  @ApiOperation({ summary: 'List cases with filters and pagination' })
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('patientId') patientId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAll({
      search,
      status,
      priority,
      patientId,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get case by ID with relations' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a case and optional study links' })
  create(
    @Body()
    body: {
      title: string;
      description?: string;
      patientId: string;
      organizationId: string;
      priority?: string;
      createdById: string;
      slaDeadline?: string | Date;
      studyIds?: string[];
    },
  ) {
    return this.service.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update case fields' })
  update(
    @Param('id') id: string,
    @Body()
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
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a case' })
  remove(@Param('id') id: string) {
    return this.service.softDelete(id);
  }
}
