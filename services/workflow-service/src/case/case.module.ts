import { Module } from '@nestjs/common';
import { CaseController } from './case.controller';
import { CaseService } from './case.service';
import { DashboardController } from './dashboard.controller';

@Module({
  controllers: [CaseController, DashboardController],
  providers: [CaseService],
  exports: [CaseService],
})
export class CaseModule {}
