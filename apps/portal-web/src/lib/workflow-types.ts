export type WorkflowNodeType = 'start' | 'task' | 'condition' | 'parallel' | 'end';
export type TaskType = 'annotate' | 'review' | 'adjudicate' | 'diagnose' | 'report';
export type AssignmentRule = 'auto' | 'manual' | string;
export type TriggerType = 'manual' | 'on_case_create' | 'on_study_arrival';
export type ConditionOperator = '>=' | '<=' | '>' | '<' | '==' | '!=';

export interface StartNodeData {
  label: string;
  trigger: TriggerType;
}

export interface TaskNodeData {
  label: string;
  taskType: TaskType;
  assignmentRule: AssignmentRule;
  slaHours: number;
  description?: string;
}

export interface ConditionNodeData {
  label: string;
  field: string;
  operator: ConditionOperator;
  value: number | string;
}

export interface ParallelNodeData {
  label: string;
  minApprovals: number;
}

export interface EndNodeData {
  label: string;
  finalStatus: 'completed' | 'cancelled';
}

export type WorkflowNodeData =
  | StartNodeData
  | TaskNodeData
  | ConditionNodeData
  | ParallelNodeData
  | EndNodeData;

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  version: number;
  status: 'draft' | 'active' | 'archived';
  stateMachineDef: {
    nodes: Array<{
      id: string;
      type: WorkflowNodeType;
      position: { x: number; y: number };
      data: WorkflowNodeData;
    }>;
    edges: Array<{
      id: string;
      source: string;
      target: string;
      label?: string;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  annotate: 'Chú thích',
  review: 'Duyệt',
  adjudicate: 'Phân xử',
  diagnose: 'Chẩn đoán',
  report: 'Báo cáo',
};

export const NODE_TYPE_CONFIG: Record<WorkflowNodeType, { label: string; color: string; icon: string }> = {
  start: { label: 'Bắt đầu', color: '#22c55e', icon: 'Play' },
  task: { label: 'Nhiệm vụ', color: '#3b82f6', icon: 'ClipboardList' },
  condition: { label: 'Điều kiện', color: '#f59e0b', icon: 'GitBranch' },
  parallel: { label: 'Song song', color: '#8b5cf6', icon: 'GitFork' },
  end: { label: 'Kết thúc', color: '#ef4444', icon: 'Square' },
};
