import { Module } from '@nestjs/common';
import { WorkflowRunController } from './workflow-run.controller';
import { WorkflowRunService } from './workflow-run.service';

@Module({
  controllers: [WorkflowRunController],
  providers: [WorkflowRunService],
  exports: [WorkflowRunService],
})
export class WorkflowRunModule {}
