'use client';

import { use, useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Pencil, GitBranchPlus, Clock, Layers, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ReactFlow, Controls, MiniMap, Background, BackgroundVariant, ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from '@/components/workflow/nodes';
import { workflowTemplateApi } from '@/lib/api';
import { PRESET_TEMPLATES } from '@/lib/workflow-presets';
import { useLocale } from '@/lib/locale-context';
import { TASK_TYPE_LABELS } from '@/lib/workflow-types';

export default function WorkflowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { locale } = useLocale();
  const vi = locale === 'vi';
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await workflowTemplateApi.get(id);
        setTemplate(data);
      } catch {
        const preset = PRESET_TEMPLATES.find((t) => t.id === id);
        if (preset) setTemplate(preset);
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (!template) return <div className="flex h-64 items-center justify-center text-muted-foreground">{vi ? 'Không tìm thấy quy trình' : 'Workflow not found'}</div>;

  const def = template.stateMachineDef;
  const taskNodes = def.nodes.filter((n: any) => n.type === 'task');

  const flowNodes = def.nodes.map((n: any) => ({
    id: n.id, type: n.type, position: n.position, data: n.data, draggable: false, selectable: false,
  }));

  const flowEdges = def.edges.map((e: any) => ({
    id: e.id, source: e.source, target: e.target, label: e.label,
    type: 'smoothstep', animated: true,
    style: { strokeWidth: 2, stroke: '#8b5cf6' },
    labelStyle: { fontSize: 11, fontWeight: 600, fill: '#6b7280' },
    labelBgStyle: { fill: '#f9fafb', stroke: '#e5e7eb', strokeWidth: 1 },
    labelBgPadding: [6, 4] as [number, number],
    labelBgBorderRadius: 6,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/workflows"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{template.name}</h1>
          <p className="text-sm text-muted-foreground">{template.description}</p>
        </div>
        <Link href={`/workflows/builder?template=${template.id}`}>
          <Button variant="outline" size="sm" className="gap-1.5"><Pencil className="h-3.5 w-3.5" />{vi ? 'Chỉnh sửa' : 'Edit'}</Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base"><GitBranchPlus className="h-4 w-4" />{vi ? 'Sơ đồ quy trình' : 'Workflow Diagram'}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div style={{ height: 500 }}>
            <ReactFlowProvider>
              <ReactFlow nodes={flowNodes} edges={flowEdges} nodeTypes={nodeTypes} fitView
                nodesDraggable={false} nodesConnectable={false} elementsSelectable={false} panOnDrag zoomOnScroll
                style={{ background: '#fafafa' }}>
                <Controls position="bottom-left" showInteractive={false} />
                <MiniMap style={{ background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }} />
                <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} color="#d4d4d8" />
              </ReactFlow>
            </ReactFlowProvider>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Layers className="h-4 w-4" />{vi ? `Các bước (${taskNodes.length})` : `Steps (${taskNodes.length})`}</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {taskNodes.map((node: any, idx: number) => {
              const d = node.data;
              return (
                <div key={node.id} className="flex items-center gap-4 rounded-lg border p-4 hover:bg-accent/30 transition-colors">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{idx + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{d.label}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">{TASK_TYPE_LABELS[d.taskType as keyof typeof TASK_TYPE_LABELS] || d.taskType}</Badge>
                      {d.slaHours && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{d.slaHours}h SLA</span>}
                      <span>{d.assignmentRule}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
