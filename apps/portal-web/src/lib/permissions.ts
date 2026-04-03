export const PERMISSION_KEYS = [
  'annotate',
  'review',
  'create_case',
  'diagnose',
  'report',
  'workflow_builder',
  'view_all_tasks',
  'admin_panel',
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

export const PERMISSION_LABELS: Record<PermissionKey, { vi: string; en: string }> = {
  annotate: { vi: 'Chú thích ảnh', en: 'Annotate images' },
  review: { vi: 'Duyệt / Phê duyệt', en: 'Review / Approve' },
  create_case: { vi: 'Tạo ca bệnh', en: 'Create cases' },
  diagnose: { vi: 'Chẩn đoán', en: 'Diagnose' },
  report: { vi: 'Tạo báo cáo', en: 'Create reports' },
  workflow_builder: { vi: 'Xây dựng quy trình', en: 'Workflow builder' },
  view_all_tasks: { vi: 'Xem tất cả nhiệm vụ', en: 'View all tasks' },
  admin_panel: { vi: 'Quản trị hệ thống', en: 'Admin panel' },
};

export const DEFAULT_ROLE_PERMISSIONS: Record<string, PermissionKey[]> = {
  system_admin: ['admin_panel', 'view_all_tasks', 'create_case', 'review', 'workflow_builder'],
  org_admin: ['admin_panel', 'view_all_tasks', 'create_case', 'review', 'workflow_builder'],
  clinical_lead: ['create_case', 'review', 'workflow_builder', 'view_all_tasks'],
  radiologist: ['review', 'diagnose'],
  annotator: ['annotate'],
  qa_reviewer: ['review'],
  data_scientist: ['view_all_tasks'],
  viewer: [],
};
