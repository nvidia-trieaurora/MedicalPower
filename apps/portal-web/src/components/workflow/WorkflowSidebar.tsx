'use client';

import { Play, ClipboardList, GitBranch, GitFork, Square } from 'lucide-react';
import type { WorkflowNodeType } from '@/lib/workflow-types';
import { NODE_TYPE_CONFIG } from '@/lib/workflow-types';

const iconMap: Record<WorkflowNodeType, React.ElementType> = {
  start: Play,
  task: ClipboardList,
  condition: GitBranch,
  parallel: GitFork,
  end: Square,
};

const colorMap: Record<WorkflowNodeType, string> = {
  start: 'border-green-300 bg-green-50 hover:border-green-500',
  task: 'border-blue-300 bg-blue-50 hover:border-blue-500',
  condition: 'border-amber-300 bg-amber-50 hover:border-amber-500',
  parallel: 'border-violet-300 bg-violet-50 hover:border-violet-500',
  end: 'border-red-300 bg-red-50 hover:border-red-500',
};

const iconColorMap: Record<WorkflowNodeType, string> = {
  start: 'bg-green-500',
  task: 'bg-blue-500',
  condition: 'bg-amber-500',
  parallel: 'bg-violet-500',
  end: 'bg-red-500',
};

export function WorkflowSidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: WorkflowNodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-56 border-r bg-card p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Kéo thả vào canvas
      </h3>
      <div className="space-y-2">
        {(Object.keys(NODE_TYPE_CONFIG) as WorkflowNodeType[]).map((type) => {
          const config = NODE_TYPE_CONFIG[type];
          const Icon = iconMap[type];
          return (
            <div
              key={type}
              className={`flex cursor-grab items-center gap-2.5 rounded-lg border-2 px-3 py-2.5 transition-colors ${colorMap[type]}`}
              draggable
              onDragStart={(e) => onDragStart(e, type)}
            >
              <div className={`flex h-7 w-7 items-center justify-center rounded-md text-white ${iconColorMap[type]}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-medium text-gray-700">{config.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
