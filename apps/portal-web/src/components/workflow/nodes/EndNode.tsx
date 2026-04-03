'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { EndNodeData } from '@/lib/workflow-types';

export function EndNode({ data, selected }: NodeProps) {
  const d = data as EndNodeData;
  return (
    <div style={{
      minWidth: 160, padding: '12px 16px',
      borderRadius: 16, border: `2px solid ${selected ? '#ef4444' : '#fca5a5'}`,
      background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
      boxShadow: selected ? '0 0 0 3px rgba(239,68,68,0.15), 0 4px 12px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.06)',
      transition: 'all 0.2s',
    }}>
      <Handle type="target" position={Position.Top} style={{ width: 10, height: 10, border: '2px solid #ef4444', background: 'white', top: -5 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(220,38,38,0.3)',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <rect x="4" y="4" width="16" height="16" rx="2" />
          </svg>
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#991b1b', letterSpacing: '0.02em' }}>KẾT THÚC</p>
          <p style={{ fontSize: 10, color: '#6b7280', marginTop: 1 }}>{d.finalStatus === 'completed' ? 'Hoàn thành' : 'Hủy'}</p>
        </div>
      </div>
    </div>
  );
}
