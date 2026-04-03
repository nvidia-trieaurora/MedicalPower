import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TaskStateMachine } from './task-state-machine';

@Module({
  controllers: [TaskController],
  providers: [TaskService, TaskStateMachine],
  exports: [TaskService, TaskStateMachine],
})
export class TaskModule {}
