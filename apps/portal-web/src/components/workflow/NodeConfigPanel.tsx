'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Node } from '@xyflow/react';
import type { WorkflowNodeType, TaskType, TriggerType, ConditionOperator } from '@/lib/workflow-types';
import { TASK_TYPE_LABELS } from '@/lib/workflow-types';

interface NodeConfigPanelProps {
  node: Node;
  onUpdate: (id: string, data: Record<string, unknown>) => void;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export function NodeConfigPanel({ node, onUpdate, onClose, onDelete }: NodeConfigPanelProps) {
  const nodeType = node.type as WorkflowNodeType;
  const data = node.data as Record<string, unknown>;

  const update = (key: string, value: unknown) => {
    onUpdate(node.id, { ...data, [key]: value });
  };

  return (
    <div className="w-72 border-l bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-semibold">Cấu hình Node</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4 p-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Tên</label>
          <input
            type="text"
            className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
            value={(data.label as string) || ''}
            onChange={(e) => update('label', e.target.value)}
          />
        </div>

        {nodeType === 'start' && (
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Trigger</label>
            <select
              className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
              value={(data.trigger as string) || 'manual'}
              onChange={(e) => update('trigger', e.target.value as TriggerType)}
            >
              <option value="manual">Thủ công</option>
              <option value="on_case_create">Khi tạo ca bệnh</option>
              <option value="on_study_arrival">Khi nhận DICOM</option>
            </select>
          </div>
        )}

        {nodeType === 'task' && (
          <>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Loại nhiệm vụ</label>
              <select
                className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                value={(data.taskType as string) || 'annotate'}
                onChange={(e) => update('taskType', e.target.value as TaskType)}
              >
                {Object.entries(TASK_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Phân công</label>
              <select
                className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                value={(data.assignmentRule as string) || 'auto'}
                onChange={(e) => update('assignmentRule', e.target.value)}
              >
                <option value="auto">Tự động</option>
                <option value="manual">Thủ công</option>
                <option value="role:annotator">Vai trò: Annotator</option>
                <option value="role:reviewer">Vai trò: Reviewer</option>
                <option value="role:radiologist">Vai trò: Bác sĩ XQ</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">SLA (giờ)</label>
              <input
                type="number"
                min={1}
                className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                value={(data.slaHours as number) || 24}
                onChange={(e) => update('slaHours', parseInt(e.target.value) || 24)}
              />
            </div>
          </>
        )}

        {nodeType === 'condition' && (
          <>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Trường dữ liệu</label>
              <select
                className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                value={(data.field as string) || 'ai_confidence'}
                onChange={(e) => update('field', e.target.value)}
              >
                <option value="ai_confidence">AI Confidence</option>
                <option value="reviewer_decision">Quyết định reviewer</option>
                <option value="consensus_score">Điểm đồng thuận</option>
                <option value="task_count">Số tasks hoàn thành</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Toán tử</label>
                <select
                  className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                  value={(data.operator as string) || '>='}
                  onChange={(e) => update('operator', e.target.value as ConditionOperator)}
                >
                  <option value=">=">≥</option>
                  <option value="<=">≤</option>
                  <option value=">">{'>'}</option>
                  <option value="<">{'<'}</option>
                  <option value="==">==</option>
                  <option value="!=">≠</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Giá trị</label>
                <input
                  type="text"
                  className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                  value={String(data.value ?? '0.85')}
                  onChange={(e) => update('value', e.target.value)}
                />
              </div>
            </div>
          </>
        )}

        {nodeType === 'parallel' && (
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Số phê duyệt tối thiểu</label>
            <input
              type="number"
              min={1}
              max={10}
              className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
              value={(data.minApprovals as number) || 2}
              onChange={(e) => update('minApprovals', parseInt(e.target.value) || 2)}
            />
          </div>
        )}

        {nodeType === 'end' && (
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Trạng thái cuối</label>
            <select
              className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
              value={(data.finalStatus as string) || 'completed'}
              onChange={(e) => update('finalStatus', e.target.value)}
            >
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Hủy</option>
            </select>
          </div>
        )}

        <div className="pt-4 border-t">
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={() => onDelete(node.id)}
          >
            Xóa Node
          </Button>
        </div>
      </div>
    </div>
  );
}
