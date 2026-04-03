import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CaseService } from './case.service';

@ApiTags('dashboard')
@Controller('api/v1/dashboard')
export class DashboardController {
  constructor(private readonly caseService: CaseService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Aggregate dashboard statistics' })
  getStats() {
    return this.caseService.getDashboardStats();
  }
}
