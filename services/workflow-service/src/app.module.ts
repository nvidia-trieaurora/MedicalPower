import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { WorkflowTemplateModule } from './workflow-template/workflow-template.module';
import { WorkflowRunModule } from './workflow-run/workflow-run.module';
import { TaskModule } from './task/task.module';
import { WorkflowEngineModule } from './engine/workflow-engine.module';
import { CaseModule } from './case/case.module';
import { PermissionModule } from './permission/permission.module';
import { NotificationModule } from './notification/notification.module';
import { RealtimeModule } from './realtime/realtime.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    PrismaModule,
    WorkflowTemplateModule,
    WorkflowRunModule,
    TaskModule,
    WorkflowEngineModule,
    CaseModule,
    PermissionModule,
    NotificationModule,
    RealtimeModule,
    ChatModule,
  ],
})
export class AppModule {}
