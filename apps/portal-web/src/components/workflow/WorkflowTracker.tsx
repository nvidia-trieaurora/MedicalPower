'use client';

import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  ReactFlowProvider,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { nodeTypes } from './nodes';
import type { WorkflowTemplate } from '@/lib/workflow-types';

interface WorkflowTrackerProps {
  template: WorkflowTemplate;
  currentNodeId?: string;
}

function TrackerInner({ template, currentNodeId }: WorkflowTrackerProps) {
  const { nodes: defNodes, edges: defEdges } = template.stateMachineDef;

  const nodes: Node[] = defNodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: n.position,
    data: n.data,
    selected: n.id === currentNodeId,
    style: n.id === currentNodeId
      ? { boxShadow: '0 0 0 3px #3b82f6', borderRadius: 12 }
      : undefined,
  }));

  const edges: Edge[] = defEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    animated: e.source === currentNodeId,
    style: { strokeWidth: 2, stroke: e.source === currentNodeId ? '#3b82f6' : '#94a3b8' },
  }));

  return (
    <div className="h-64 w-full rounded-lg border bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e2e8f0" />
      </ReactFlow>
    </div>
  );
}

export function WorkflowTracker(props: WorkflowTrackerProps) {
  return (
    <ReactFlowProvider>
      <TrackerInner {...props} />
    </ReactFlowProvider>
  );
}
