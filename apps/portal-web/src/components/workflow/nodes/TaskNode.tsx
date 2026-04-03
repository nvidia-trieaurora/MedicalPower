'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { TaskNodeData } from '@/lib/workflow-types';
import { TASK_TYPE_LABELS } from '@/lib/workflow-types';

export function TaskNode({ data, selected }: NodeProps) {
  const d = data as TaskNodeData;
  return (
    <div style={{
      minWidth: 200, padding: '12px 16px',
      borderRadius: 16, border: `2px solid ${selected ? '#3b82f6' : '#93c5fd'}`,
      background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      boxShadow: selected ? '0 0 0 3px rgba(59,130,246,0.15), 0 4px 12px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.06)',
      transition: 'all 0.2s',
    }}>
      <Handle type="target" position={Position.Top} style={{ width: 10, height: 10, border: '2px solid #3b82f6', background: 'white', top: -5 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(37,99,235,0.3)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 12l2 2 4-4" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#1e3a5f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.label}</p>
          <p style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>
            {TASK_TYPE_LABELS[d.taskType]} · {d.slaHours}h SLA
          </p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ width: 10, height: 10, border: '2px solid #3b82f6', background: 'white', bottom: -5 }} />
    </div>
  );
}
