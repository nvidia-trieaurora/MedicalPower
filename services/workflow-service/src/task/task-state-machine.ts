import { Injectable, BadRequestException } from '@nestjs/common';

type TaskStatus = 'created' | 'assigned' | 'in_progress' | 'submitted' | 'in_review' | 'approved' | 'rejected' | 'completed';
type TaskAction = 'assign' | 'start' | 'submit' | 'send_for_review' | 'approve' | 'reject' | 'reassign' | 'complete';

const TRANSITIONS: Record<TaskStatus, Partial<Record<TaskAction, TaskStatus>>> = {
  created:     { assign: 'assigned' },
  assigned:    { start: 'in_progress' },
  in_progress: { submit: 'submitted' },
  submitted:   { send_for_review: 'in_review', approve: 'approved' },
  in_review:   { approve: 'approved', reject: 'rejected' },
  approved:    { complete: 'completed' },
  rejected:    { reassign: 'in_progress' },
  completed:   {},
};

const TERMINAL_STATES: TaskStatus[] = ['completed'];

@Injectable()
export class TaskStateMachine {
  transition(currentStatus: string, action: TaskAction): TaskStatus {
    const transitions = TRANSITIONS[currentStatus as TaskStatus];
    if (!transitions) {
      throw new BadRequestException(`Unknown task status: ${currentStatus}`);
    }

    const nextStatus = transitions[action];
    if (!nextStatus) {
      throw new BadRequestException(
        `Cannot perform "${action}" on task with status "${currentStatus}". ` +
        `Allowed actions: ${Object.keys(transitions).join(', ') || 'none'}`
      );
    }

    return nextStatus;
  }

  isTerminal(status: string): boolean {
    return TERMINAL_STATES.includes(status as TaskStatus);
  }

  getAllowedActions(status: string): TaskAction[] {
    const transitions = TRANSITIONS[status as TaskStatus];
    return transitions ? (Object.keys(transitions) as TaskAction[]) : [];
  }
}
