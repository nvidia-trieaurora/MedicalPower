'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ParallelNodeData } from '@/lib/workflow-types';

export function ParallelNode({ data, selected }: NodeProps) {
  const d = data as ParallelNodeData;
  return (
    <div style={{
      minWidth: 200, padding: '12px 16px',
      borderRadius: 16, border: `2px solid ${selected ? '#8b5cf6' : '#c4b5fd'}`,
      background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
      boxShadow: selected ? '0 0 0 3px rgba(139,92,246,0.15), 0 4px 12px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.06)',
      transition: 'all 0.2s',
    }}>
      <Handle type="target" position={Position.Top} style={{ width: 10, height: 10, border: '2px solid #8b5cf6', background: 'white', top: -5 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(124,58,237,0.3)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><circle cx="18" cy="6" r="3" /><path d="M12 15V9" /><path d="M6 9v3a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#5b21b6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.label}</p>
          <p style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>Cần {d.minApprovals} phê duyệt</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ width: 10, height: 10, border: '2px solid #8b5cf6', background: 'white', bottom: -5 }} />
    </div>
  );
}
