import type { WorkflowTemplate } from './workflow-types';

export const PRESET_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'preset_simple',
    name: 'Simple Annotation',
    description: 'Quy trình đơn giản: Upload → AI Segment → Review → Hoàn thành',
    version: 1,
    status: 'active',
    stateMachineDef: {
      nodes: [
        { id: 'start', type: 'start', position: { x: 250, y: 0 }, data: { label: 'Bắt đầu', trigger: 'on_case_create' } },
        { id: 'ai_segment', type: 'task', position: { x: 250, y: 120 }, data: { label: 'AI Segmentation', taskType: 'annotate', assignmentRule: 'auto', slaHours: 4 } },
        { id: 'review', type: 'task', position: { x: 250, y: 240 }, data: { label: 'Review kết quả', taskType: 'review', assignmentRule: 'role:reviewer', slaHours: 24 } },
        { id: 'end', type: 'end', position: { x: 250, y: 360 }, data: { label: 'Hoàn thành', finalStatus: 'completed' } },
      ],
      edges: [
        { id: 'e1', source: 'start', target: 'ai_segment' },
        { id: 'e2', source: 'ai_segment', target: 'review' },
        { id: 'e3', source: 'review', target: 'end' },
      ],
    },
    createdAt: '2026-03-21T00:00:00Z',
    updatedAt: '2026-03-21T00:00:00Z',
  },
  {
    id: 'preset_double_read',
    name: 'Double-Read QA',
    description: 'QA nâng cao: AI Segment → Kiểm tra confidence → 2 reviewers song song hoặc 1 reviewer → Hoàn thành',
    version: 1,
    status: 'active',
    stateMachineDef: {
      nodes: [
        { id: 'start', type: 'start', position: { x: 300, y: 0 }, data: { label: 'Bắt đầu', trigger: 'on_case_create' } },
        { id: 'ai_segment', type: 'task', position: { x: 300, y: 120 }, data: { label: 'AI Segmentation', taskType: 'annotate', assignmentRule: 'auto', slaHours: 4 } },
        { id: 'check_conf', type: 'condition', position: { x: 300, y: 240 }, data: { label: 'AI Confidence', field: 'ai_confidence', operator: '>=', value: 0.85 } },
        { id: 'single_review', type: 'task', position: { x: 120, y: 380 }, data: { label: 'Single Review', taskType: 'review', assignmentRule: 'role:reviewer', slaHours: 24 } },
        { id: 'double_review', type: 'parallel', position: { x: 480, y: 380 }, data: { label: 'Double Review', minApprovals: 2 } },
        { id: 'end', type: 'end', position: { x: 300, y: 520 }, data: { label: 'Hoàn thành', finalStatus: 'completed' } },
      ],
      edges: [
        { id: 'e1', source: 'start', target: 'ai_segment' },
        { id: 'e2', source: 'ai_segment', target: 'check_conf' },
        { id: 'e3', source: 'check_conf', target: 'single_review', label: 'Confidence cao' },
        { id: 'e4', source: 'check_conf', target: 'double_review', label: 'Confidence thấp' },
        { id: 'e5', source: 'single_review', target: 'end' },
        { id: 'e6', source: 'double_review', target: 'end' },
      ],
    },
    createdAt: '2026-03-21T00:00:00Z',
    updatedAt: '2026-03-21T00:00:00Z',
  },
  {
    id: 'preset_full_diagnostic',
    name: 'Full Diagnostic Pipeline',
    description: 'Quy trình đầy đủ: AI Segment → Annotate → Review → Chẩn đoán → Báo cáo → Hoàn thành',
    version: 1,
    status: 'active',
    stateMachineDef: {
      nodes: [
        { id: 'start', type: 'start', position: { x: 250, y: 0 }, data: { label: 'Bắt đầu', trigger: 'on_case_create' } },
        { id: 'ai_segment', type: 'task', position: { x: 250, y: 100 }, data: { label: 'AI Segmentation', taskType: 'annotate', assignmentRule: 'auto', slaHours: 4 } },
        { id: 'annotate', type: 'task', position: { x: 250, y: 200 }, data: { label: 'Chú thích thủ công', taskType: 'annotate', assignmentRule: 'role:annotator', slaHours: 48 } },
        { id: 'review', type: 'task', position: { x: 250, y: 300 }, data: { label: 'Review', taskType: 'review', assignmentRule: 'role:reviewer', slaHours: 24 } },
        { id: 'diagnose', type: 'task', position: { x: 250, y: 400 }, data: { label: 'Chẩn đoán', taskType: 'diagnose', assignmentRule: 'role:radiologist', slaHours: 48 } },
        { id: 'report', type: 'task', position: { x: 250, y: 500 }, data: { label: 'Báo cáo', taskType: 'report', assignmentRule: 'manual', slaHours: 72 } },
        { id: 'end', type: 'end', position: { x: 250, y: 600 }, data: { label: 'Hoàn thành', finalStatus: 'completed' } },
      ],
      edges: [
        { id: 'e1', source: 'start', target: 'ai_segment' },
        { id: 'e2', source: 'ai_segment', target: 'annotate' },
        { id: 'e3', source: 'annotate', target: 'review' },
        { id: 'e4', source: 'review', target: 'diagnose' },
        { id: 'e5', source: 'diagnose', target: 'report' },
        { id: 'e6', source: 'report', target: 'end' },
      ],
    },
    createdAt: '2026-03-21T00:00:00Z',
    updatedAt: '2026-03-21T00:00:00Z',
  },
];
