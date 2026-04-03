'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { StartNodeData } from '@/lib/workflow-types';

const triggerLabels: Record<string, string> = {
  manual: 'Thủ công',
  on_case_create: 'Khi tạo ca',
  on_study_arrival: 'Khi nhận DICOM',
};

export function StartNode({ data, selected }: NodeProps) {
  const d = data as StartNodeData;
  return (
    <div style={{
      minWidth: 180, padding: '12px 16px',
      borderRadius: 16, border: `2px solid ${selected ? '#16a34a' : '#86efac'}`,
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      boxShadow: selected ? '0 0 0 3px rgba(22,163,74,0.15), 0 4px 12px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.06)',
      transition: 'all 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(22,163,74,0.3)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#15803d', letterSpacing: '0.02em' }}>BẮT ĐẦU</p>
          <p style={{ fontSize: 10, color: '#6b7280', marginTop: 1 }}>{triggerLabels[d.trigger] || d.trigger}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ width: 10, height: 10, border: '2px solid #22c55e', background: 'white', bottom: -5 }} />
    </div>
  );
}
