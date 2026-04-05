'use client';

import { Suspense, useCallback, useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, Trash2, X, Undo2, Redo2 } from 'lucide-react';
import { PRESET_TEMPLATES } from '@/lib/workflow-presets';
import {
  ReactFlow, addEdge, useNodesState, useEdgesState, Controls, MiniMap,
  Background, BackgroundVariant,
  type Connection, type Edge, type Node, ReactFlowProvider,
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

interface HistoryState { nodes: Node[]; edges: Edge[] }

function WorkflowBuilderInner() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([] as Edge[]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [workflowName, setWorkflowName] = useState('Workflow mới');
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Undo/Redo history
  const historyRef = useRef<HistoryState[]>([]);
  const historyIndexRef = useRef(-1);
  const isUndoRedoRef = useRef(false);

  const pushHistory = useCallback(() => {
    if (isUndoRedoRef.current) { isUndoRedoRef.current = false; return; }
    const state: HistoryState = { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) };
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(state);
    historyIndexRef.current = historyRef.current.length - 1;
  }, [nodes, edges]);

  useEffect(() => { pushHistory(); }, [nodes.length, edges.length]);

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    const state = historyRef.current[historyIndexRef.current];
    isUndoRedoRef.current = true;
    setNodes(state.nodes);
    setEdges(state.edges);
  }, [setNodes, setEdges]);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    const state = historyRef.current[historyIndexRef.current];
    isUndoRedoRef.current = true;
    setNodes(state.nodes);
    setEdges(state.edges);
  }, [setNodes, setEdges]);

  // Load template
  useEffect(() => {
    if (!templateId) return;
    (async () => {
      let tpl: any = null;
      try { tpl = await (await import('@/lib/api')).workflowTemplateApi.get(templateId); }
      catch { tpl = PRESET_TEMPLATES.find((t) => t.id === templateId); }
      if (!tpl?.stateMachineDef) return;
      setWorkflowName(tpl.name);
      setNodes(tpl.stateMachineDef.nodes.map((n: any) => ({ id: n.id, type: n.type, position: n.position, data: { ...n.data } })));
      setEdges(tpl.stateMachineDef.edges.map((e: any) => ({ id: e.id, source: e.source, target: e.target, label: e.label, type: 'smoothstep', animated: true, style: { strokeWidth: 2, stroke: '#8b5cf6' } })));
      const maxId = tpl.stateMachineDef.nodes.reduce((max: number, n: any) => { const num = parseInt(n.id.replace('node_', ''), 10); return isNaN(num) ? max : Math.max(max, num); }, 0);
      idCounter = maxId;
    })();
  }, [templateId, setNodes, setEdges]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if (meta && e.key === 'z' && e.shiftKey) { e.preventDefault(); redo(); }
      if (meta && e.key === 'x') {
        e.preventDefault();
        if (selectedEdge) { deleteEdge(selectedEdge.id); }
        else if (selectedNode) { deleteNode(selectedNode.id); }
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedEdge) { deleteEdge(selectedEdge.id); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedEdge, selectedNode, undo, redo]);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({ ...params, type: 'smoothstep', animated: true, style: { strokeWidth: 2, stroke: '#8b5cf6' } }, eds));
  }, [setEdges]);

  const onDragOver = useCallback((event: React.DragEvent) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow') as WorkflowNodeType;
    if (!type || !reactFlowInstance) return;
    const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    setNodes((nds) => nds.concat({ id: getId(), type, position, data: { ...DEFAULT_NODE_DATA[type] } }));
  }, [reactFlowInstance, setNodes]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => { setSelectedNode(node); setSelectedEdge(null); }, []);
  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => { setSelectedEdge(edge); setSelectedNode(null); }, []);
  const onPaneClick = useCallback(() => { setSelectedNode(null); setSelectedEdge(null); }, []);

  const updateNodeData = useCallback((id: string, data: Record<string, unknown>) => {
    setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data } : n)));
    setSelectedNode((prev) => (prev?.id === id ? { ...prev, data } : prev));
  }, [setNodes]);

  const deleteNode = useCallback((id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    setSelectedNode(null);
  }, [setNodes, setEdges]);

  const deleteEdge = useCallback((id: string) => {
    setEdges((eds) => eds.filter((e) => e.id !== id));
    setSelectedEdge(null);
  }, [setEdges]);

  const handleSave = async () => {
    const stateMachineDef = {
      nodes: nodes.map((n) => ({ id: n.id, type: n.type as WorkflowNodeType, position: n.position, data: n.data })),
      edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target, label: (e.label as string) || undefined })),
    };
    try {
      const { workflowTemplateApi } = await import('@/lib/api');
      if (templateId) await workflowTemplateApi.update(templateId, { name: workflowName, stateMachineDef });
      else await workflowTemplateApi.create({ name: workflowName, stateMachineDef, organizationId: 'org_001' });
      window.location.href = '/workflows';
    } catch { console.error('Save failed'); }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b bg-card px-4 py-2">
        <div className="flex items-center gap-3">
          <Link href="/workflows"><Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <input type="text" value={workflowName} onChange={(e) => setWorkflowName(e.target.value)}
            className="border-none bg-transparent text-lg font-semibold outline-none focus:ring-0" />
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={undo} title="Undo (Cmd+Z)" className="h-8 w-8 p-0">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={redo} title="Redo (Cmd+Shift+Z)" className="h-8 w-8 p-0">
            <Redo2 className="h-4 w-4" />
          </Button>
          <div className="mx-2 h-5 w-px bg-border" />
          <Button size="sm" onClick={handleSave} className="gap-1.5"><Save className="h-3.5 w-3.5" />Lưu</Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <WorkflowSidebar />

        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes} edges={edges}
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            onConnect={onConnect} onInit={setReactFlowInstance}
            onDrop={onDrop} onDragOver={onDragOver}
            onNodeClick={onNodeClick} onEdgeClick={onEdgeClick} onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView snapToGrid snapGrid={[20, 20]}
            connectionLineStyle={{ stroke: '#8b5cf6', strokeWidth: 2 }}
            defaultEdgeOptions={{ type: 'smoothstep', animated: true, style: { strokeWidth: 2, stroke: '#8b5cf6' } }}
            style={{ background: '#fafafa' }}
            deleteKeyCode={null}
          >
            <Controls position="bottom-left"
              style={{ display: 'flex', flexDirection: 'row', gap: 4, background: 'white', borderRadius: 12, padding: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
            <MiniMap nodeStrokeWidth={2}
              style={{ background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}
              maskColor="rgba(139, 92, 246, 0.08)" />
            <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} color="#d4d4d8" />
          </ReactFlow>
        </div>

        {/* Edge config panel */}
        {selectedEdge && !selectedNode && (
          <div className="w-64 border-l bg-card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Kết nối</h3>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setSelectedEdge(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Từ:</span><span className="font-mono text-xs">{selectedEdge.source}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Đến:</span><span className="font-mono text-xs">{selectedEdge.target}</span></div>
              {selectedEdge.label && <div className="flex justify-between"><span className="text-muted-foreground">Nhãn:</span><span>{selectedEdge.label as string}</span></div>}
            </div>
            <div className="border-t pt-3 space-y-2">
              <Button variant="destructive" size="sm" className="w-full gap-1.5" onClick={() => deleteEdge(selectedEdge.id)}>
                <Trash2 className="h-3.5 w-3.5" />Xóa kết nối
              </Button>
              <p className="text-[10px] text-muted-foreground text-center">Hoặc nhấn Delete / Cmd+X</p>
            </div>
          </div>
        )}

        {selectedNode && (
          <NodeConfigPanel node={selectedNode} onUpdate={updateNodeData} onClose={() => setSelectedNode(null)} onDelete={deleteNode} />
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between border-t bg-card px-4 py-1 text-[11px] text-muted-foreground">
        <div className="flex gap-4">
          <span>{nodes.length} nodes</span>
          <span>{edges.length} edges</span>
        </div>
        <div className="flex gap-3">
          <span><kbd className="rounded bg-muted px-1 font-mono text-[10px]">⌘Z</kbd> Undo</span>
          <span><kbd className="rounded bg-muted px-1 font-mono text-[10px]">⌘⇧Z</kbd> Redo</span>
          <span><kbd className="rounded bg-muted px-1 font-mono text-[10px]">⌘X</kbd> Xóa</span>
          <span><kbd className="rounded bg-muted px-1 font-mono text-[10px]">Del</kbd> Xóa edge</span>
        </div>
      </div>
    </div>
  );
}

export default function WorkflowBuilderPage() {
  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center">Loading...</div>}>
      <ReactFlowProvider>
        <WorkflowBuilderInner />
      </ReactFlowProvider>
    </Suspense>
  );
}
