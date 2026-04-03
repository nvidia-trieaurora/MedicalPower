'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ConditionNodeData } from '@/lib/workflow-types';

export function ConditionNode({ data, selected }: NodeProps) {
  const d = data as ConditionNodeData;
  return (
    <div style={{
      minWidth: 200, padding: '12px 16px',
      borderRadius: 16, border: `2px solid ${selected ? '#f59e0b' : '#fcd34d'}`,
      background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
      boxShadow: selected ? '0 0 0 3px rgba(245,158,11,0.15), 0 4px 12px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.06)',
      transition: 'all 0.2s',
    }}>
      <Handle type="target" position={Position.Top} style={{ width: 10, height: 10, border: '2px solid #f59e0b', background: 'white', top: -5 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(217,119,6,0.3)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="6" y1="3" x2="6" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#92400e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.label}</p>
          <p style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>{d.field} {d.operator} {d.value}</p>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, padding: '0 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 600, color: '#16a34a', background: '#dcfce7', padding: '1px 6px', borderRadius: 4 }}>YES</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 600, color: '#dc2626', background: '#fee2e2', padding: '1px 6px', borderRadius: 4 }}>NO</span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} id="yes" style={{ width: 10, height: 10, border: '2px solid #22c55e', background: '#dcfce7', left: '30%', bottom: -5 }} />
      <Handle type="source" position={Position.Bottom} id="no" style={{ width: 10, height: 10, border: '2px solid #ef4444', background: '#fee2e2', left: '70%', bottom: -5 }} />
    </div>
  );
}
