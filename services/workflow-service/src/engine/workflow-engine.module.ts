import { Module } from '@nestjs/common';
import { WorkflowEngineService } from './workflow-engine.service';
import { WorkflowTemplateModule } from '../workflow-template/workflow-template.module';
import { WorkflowRunModule } from '../workflow-run/workflow-run.module';
import { TaskModule } from '../task/task.module';

@Module({
  imports: [WorkflowTemplateModule, WorkflowRunModule, TaskModule],
  providers: [WorkflowEngineService],
  exports: [WorkflowEngineService],
})
export class WorkflowEngineModule {}
