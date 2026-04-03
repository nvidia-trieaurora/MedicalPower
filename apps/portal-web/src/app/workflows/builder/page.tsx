'use client';

import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  type Connection,
  type Edge,
  type Node,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Button } from '@/components/ui/button';
import { nodeTypes } from '@/components/workflow/nodes';
import { WorkflowSidebar } from '@/components/workflow/WorkflowSidebar';
import { NodeConfigPanel } from '@/components/workflow/NodeConfigPanel';
import type { WorkflowNodeType } from '@/lib/workflow-types';

const DEFAULT_NODE_DATA: Record<WorkflowNodeType, Record<string, unknown>> = {
  start: { label: 'Bắt đầu', trigger: 'manual' },
  task: { label: 'Nhiệm vụ mới', taskType: 'annotate', assignmentRule: 'auto', slaHours: 24 },
  condition: { label: 'Kiểm tra', field: 'ai_confidence', operator: '>=', value: 0.85 },
  parallel: { label: 'Song song', minApprovals: 2 },
  end: { label: 'Kết thúc', finalStatus: 'completed' },
};

let idCounter = 0;
const getId = () => `node_${++idCounter}`;

function WorkflowBuilderInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [workflowName, setWorkflowName] = useState('Workflow mới');
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { strokeWidth: 2, stroke: '#94a3b8' },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow') as WorkflowNodeType;
      if (!type || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: { ...DEFAULT_NODE_DATA[type] },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const updateNodeData = useCallback(
    (id: string, data: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data } : n))
      );
      setSelectedNode((prev) => (prev?.id === id ? { ...prev, data } : prev));
    },
    [setNodes]
  );

  const deleteNode = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
      setSelectedNode(null);
    },
    [setNodes, setEdges]
  );

  const handleSave = () => {
    const template = {
      name: workflowName,
      description: '',
      version: 1,
      status: 'draft' as const,
      stateMachineDef: {
        nodes: nodes.map((n) => ({
          id: n.id,
          type: n.type as WorkflowNodeType,
          position: n.position,
          data: n.data,
        })),
        edges: edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: (e.label as string) || undefined,
        })),
      },
    };
    console.log('Saving workflow template:', JSON.stringify(template, null, 2));
    alert('Workflow đã lưu! (Demo — chưa kết nối API)');
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="flex items-center justify-between border-b bg-card px-4 py-2">
        <div className="flex items-center gap-3">
          <Link href="/workflows">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="border-none bg-transparent text-lg font-semibold outline-none focus:ring-0"
          />
        </div>
        <Button size="sm" onClick={handleSave} className="gap-1.5">
          <Save className="h-3.5 w-3.5" />
          Lưu Workflow
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <WorkflowSidebar />

        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[20, 20]}
            connectionLineStyle={{ stroke: '#8b5cf6', strokeWidth: 2 }}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true,
              style: { strokeWidth: 2, stroke: '#8b5cf6' },
            }}
            style={{ background: '#fafafa' }}
          >
            <Controls
              position="bottom-left"
              style={{ display: 'flex', flexDirection: 'row', gap: 4, background: 'white', borderRadius: 12, padding: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            />
            <MiniMap
              nodeStrokeWidth={2}
              style={{ background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}
              maskColor="rgba(139, 92, 246, 0.08)"
            />
            <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} color="#d4d4d8" />
          </ReactFlow>
        </div>

        {selectedNode && (
          <NodeConfigPanel
            node={selectedNode}
            onUpdate={updateNodeData}
            onClose={() => setSelectedNode(null)}
            onDelete={deleteNode}
          />
        )}
      </div>
    </div>
  );
}

export default function WorkflowBuilderPage() {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderInner />
    </ReactFlowProvider>
  );
}
