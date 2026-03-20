import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { QueryPatientDto } from './dto/query-patient.dto';

@ApiTags('patients')
@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new patient' })
  @ApiResponse({ status: 201, description: 'Patient created successfully' })
  @ApiResponse({ status: 409, description: 'Patient with this MRN already exists' })
  async create(@Body() dto: CreatePatientDto) {
    const patient = await this.patientService.create(dto);
    return { data: patient };
  }

  @Get()
  @ApiOperation({ summary: 'Search and list patients' })
  @ApiResponse({ status: 200, description: 'Paginated patient list' })
  async findAll(@Query() query: QueryPatientDto) {
    // TODO: Extract organizationId from JWT token after auth integration
    const orgId = query.search ? undefined : undefined;

    const result = await this.patientService.findAll(query, orgId as any);
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get patient by ID with cases and studies' })
  @ApiResponse({ status: 200, description: 'Patient details' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async findOne(@Param('id') id: string) {
    const patient = await this.patientService.findOne(id);
    return { data: patient };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update patient information' })
  @ApiResponse({ status: 200, description: 'Patient updated' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async update(@Param('id') id: string, @Body() dto: UpdatePatientDto) {
    const patient = await this.patientService.update(id, dto);
    return { data: patient };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a patient' })
  @ApiResponse({ status: 204, description: 'Patient deleted' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async remove(@Param('id') id: string) {
    await this.patientService.softDelete(id);
  }
}
