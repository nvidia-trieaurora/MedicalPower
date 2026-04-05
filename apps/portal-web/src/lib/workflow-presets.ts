import type { WorkflowTemplate } from './workflow-types';

export const PRESET_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'wf_annotation_review',
    name: 'Gán nhãn & Duyệt',
    description: 'Quy trình chuẩn bệnh viện: Tiếp nhận → AI hỗ trợ gán nhãn → Bác sĩ chú thích → Trưởng khoa duyệt → Hoàn thành. Phù hợp cho annotation CT/MRI thường quy.',
    version: 1,
    status: 'active',
    stateMachineDef: {
      nodes: [
        { id: 'start', type: 'start', position: { x: 400, y: 0 }, data: { label: 'Tiếp nhận ca', trigger: 'on_case_create' } },
        { id: 'ai_assist', type: 'task', position: { x: 400, y: 130 }, data: { label: 'AI hỗ trợ phân đoạn', taskType: 'annotate', assignmentRule: 'auto', slaHours: 2 } },
        { id: 'manual_annotate', type: 'task', position: { x: 400, y: 270 }, data: { label: 'Bác sĩ chú thích', taskType: 'annotate', assignmentRule: 'role:annotator', slaHours: 24 } },
        { id: 'lead_review', type: 'task', position: { x: 400, y: 410 }, data: { label: 'Trưởng khoa duyệt', taskType: 'review', assignmentRule: 'role:reviewer', slaHours: 12 } },
        { id: 'check_quality', type: 'condition', position: { x: 400, y: 550 }, data: { label: 'Đạt chất lượng?', field: 'review_result', operator: '==', value: 'approved' } },
        { id: 'done', type: 'end', position: { x: 250, y: 700 }, data: { label: 'Hoàn thành', finalStatus: 'completed' } },
        { id: 'redo', type: 'task', position: { x: 600, y: 700 }, data: { label: 'Chỉnh sửa lại', taskType: 'annotate', assignmentRule: 'role:annotator', slaHours: 12 } },
      ],
      edges: [
        { id: 'e1', source: 'start', target: 'ai_assist' },
        { id: 'e2', source: 'ai_assist', target: 'manual_annotate' },
        { id: 'e3', source: 'manual_annotate', target: 'lead_review' },
        { id: 'e4', source: 'lead_review', target: 'check_quality' },
        { id: 'e5', source: 'check_quality', target: 'done', label: 'Đạt' },
        { id: 'e6', source: 'check_quality', target: 'redo', label: 'Chưa đạt' },
        { id: 'e7', source: 'redo', target: 'lead_review' },
      ],
    },
    createdAt: '2026-03-21T00:00:00Z',
    updatedAt: '2026-03-21T00:00:00Z',
  },
  {
    id: 'wf_diagnosis_report',
    name: 'Chẩn đoán & Báo cáo',
    description: 'Quy trình chẩn đoán đầy đủ: AI phân tích → Bác sĩ chẩn đoán → Hội chẩn (nếu cần) → Viết báo cáo → Trưởng khoa phê duyệt. Dùng cho ca phức tạp cần hội chẩn.',
    version: 1,
    status: 'active',
    stateMachineDef: {
      nodes: [
        { id: 'start', type: 'start', position: { x: 400, y: 0 }, data: { label: 'Tiếp nhận ca', trigger: 'on_case_create' } },
        { id: 'ai_analysis', type: 'task', position: { x: 400, y: 130 }, data: { label: 'AI phân tích ảnh', taskType: 'annotate', assignmentRule: 'auto', slaHours: 1 } },
        { id: 'doctor_diagnose', type: 'task', position: { x: 400, y: 270 }, data: { label: 'Bác sĩ chẩn đoán', taskType: 'diagnose', assignmentRule: 'role:radiologist', slaHours: 24 } },
        { id: 'need_consult', type: 'condition', position: { x: 400, y: 410 }, data: { label: 'Cần hội chẩn?', field: 'complexity', operator: '>=', value: 'high' } },
        { id: 'consultation', type: 'parallel', position: { x: 600, y: 550 }, data: { label: 'Hội chẩn chuyên gia', minApprovals: 2 } },
        { id: 'write_report', type: 'task', position: { x: 400, y: 700 }, data: { label: 'Viết báo cáo', taskType: 'report', assignmentRule: 'role:radiologist', slaHours: 48 } },
        { id: 'approve_report', type: 'task', position: { x: 400, y: 840 }, data: { label: 'Trưởng khoa phê duyệt', taskType: 'review', assignmentRule: 'role:reviewer', slaHours: 12 } },
        { id: 'done', type: 'end', position: { x: 400, y: 970 }, data: { label: 'Hoàn thành', finalStatus: 'completed' } },
      ],
      edges: [
        { id: 'e1', source: 'start', target: 'ai_analysis' },
        { id: 'e2', source: 'ai_analysis', target: 'doctor_diagnose' },
        { id: 'e3', source: 'doctor_diagnose', target: 'need_consult' },
        { id: 'e4', source: 'need_consult', target: 'write_report', label: 'Không cần' },
        { id: 'e5', source: 'need_consult', target: 'consultation', label: 'Cần hội chẩn' },
        { id: 'e6', source: 'consultation', target: 'write_report' },
        { id: 'e7', source: 'write_report', target: 'approve_report' },
        { id: 'e8', source: 'approve_report', target: 'done' },
      ],
    },
    createdAt: '2026-03-21T00:00:00Z',
    updatedAt: '2026-03-21T00:00:00Z',
  },
];
