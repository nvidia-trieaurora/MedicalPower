'use client';

import { StartNode } from './StartNode';
import { TaskNode } from './TaskNode';
import { ConditionNode } from './ConditionNode';
import { ParallelNode } from './ParallelNode';
import { EndNode } from './EndNode';

export { StartNode, TaskNode, ConditionNode, ParallelNode, EndNode };

export const nodeTypes = {
  start: StartNode,
  task: TaskNode,
  condition: ConditionNode,
  parallel: ParallelNode,
  end: EndNode,
} as const;
