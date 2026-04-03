export interface Patient {
  id: string;
  mrn: string;
  fullName: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  nationalId: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Study {
  id: string;
  studyInstanceUid: string;
  patientId: string;
  patientName: string;
  modality: string;
  description: string;
  studyDate: string;
  numSeries: number;
  numInstances: number;
}

export interface Case {
  id: string;
  title: string;
  description: string;
  patientId: string;
  patientName: string;
  priority: 'critical' | 'high' | 'normal' | 'low';
  status: 'draft' | 'open' | 'in_progress' | 'review' | 'completed' | 'closed';
  assignedTo: string | null;
  studyIds: string[];
  taxonomyTags: string[];
  slaDeadline: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  caseId: string;
  caseTitle: string;
  patientName: string;
  type: 'annotate' | 'review' | 'adjudicate' | 'diagnose' | 'report';
  status: 'created' | 'assigned' | 'in_progress' | 'submitted' | 'in_review' | 'approved' | 'rejected' | 'completed';
  assignedTo: string | null;
  priority: 'critical' | 'high' | 'normal' | 'low';
  studyUid: string;
  modality: string;
  slaDeadline: string | null;
  createdAt: string;
}

export const mockPatients: Patient[] = [
  { id: 'pat_001', mrn: '23057406', fullName: 'Bùi Trọng Tình', dob: '1984-02-29', gender: 'male', nationalId: '079123456789', phone: '+84 909 000 001', address: 'BV Thống Nhất, TP.HCM', status: 'active', createdAt: '2023-03-14T07:00:00Z' },
  { id: 'pat_002', mrn: '15122510', fullName: 'Bùi Viết Lâm', dob: '1970-01-01', gender: 'male', nationalId: '079234567890', phone: '+84 908 234 567', address: 'TP.HCM', status: 'active', createdAt: '2019-03-19T07:00:00Z' },
  { id: 'pat_003', mrn: '13093945', fullName: 'Bùi Thế Thiêm', dob: '1965-01-01', gender: 'male', nationalId: '079345678901', phone: '+84 912 345 678', address: 'TP.HCM', status: 'active', createdAt: '2023-04-20T07:00:00Z' },
];

export const mockStudies: Study[] = [
  { id: 'std_001', studyInstanceUid: '1.2.840.113704.1.111.13428.1678778829.1', patientId: 'pat_001', patientName: 'Bùi Trọng Tình', modality: 'CT', description: 'CT cột sống cổ có tiêm thuốc cản quang', studyDate: '2023-03-14', numSeries: 1, numInstances: 598 },
  { id: 'std_002', studyInstanceUid: '1.2.840.113704.1.111.11228.1696305185.1', patientId: 'pat_001', patientName: 'Bùi Trọng Tình', modality: 'CT', description: 'CT cột sống cổ có tiêm thuốc cản quang (tái khám)', studyDate: '2023-10-03', numSeries: 1, numInstances: 520 },
  { id: 'std_003', studyInstanceUid: '1.2.840.113704.1.111.9072.1552979082.1', patientId: 'pat_002', patientName: 'Bùi Viết Lâm', modality: 'CT', description: 'CT hàm-mặt có tiêm thuốc cản quang', studyDate: '2019-03-19', numSeries: 1, numInstances: 341 },
  { id: 'std_004', studyInstanceUid: '1.2.840.113704.1.111.9500.1681976622.1', patientId: 'pat_003', patientName: 'Bùi Thế Thiêm', modality: 'CT', description: 'CT cột sống cổ có tiêm thuốc cản quang', studyDate: '2023-04-20', numSeries: 1, numInstances: 457 },
  { id: 'std_005', studyInstanceUid: '1.2.840.113704.1.111.5364.1685941505.1', patientId: 'pat_003', patientName: 'Bùi Thế Thiêm', modality: 'CT', description: 'CT cột sống cổ có tiêm thuốc cản quang (tái khám)', studyDate: '2023-06-05', numSeries: 1, numInstances: 487 },
];

export const mockCases: Case[] = [
  { id: 'case_001', title: 'CT C-Spine - Đánh giá áp xe', description: 'Đánh giá áp xe cột sống cổ trên CT có tiêm thuốc cản quang - BV Thống Nhất (lần 1 + tái khám)', patientId: 'pat_001', patientName: 'Bùi Trọng Tình', priority: 'high', status: 'in_progress', assignedTo: 'Nguyễn Thị Mai', studyIds: ['std_001', 'std_002'], taxonomyTags: ['Abscess', 'C-Spine', 'CT Contrast'], slaDeadline: '2026-03-25T18:00:00Z', createdBy: 'Nguyễn Thị Lan', createdAt: '2023-03-14T14:27:00Z', updatedAt: '2026-03-23T14:30:00Z' },
  { id: 'case_002', title: 'CT Hàm-Mặt - Đánh giá tổn thương', description: 'Đánh giá tổn thương hàm-mặt trên CT có tiêm thuốc cản quang', patientId: 'pat_002', patientName: 'Bùi Viết Lâm', priority: 'normal', status: 'open', assignedTo: null, studyIds: ['std_003'], taxonomyTags: ['Face', 'CT Contrast'], slaDeadline: null, createdBy: 'Dr. Đỗ Bảo Ngọc', createdAt: '2019-03-19T14:00:00Z', updatedAt: '2019-03-19T14:00:00Z' },
  { id: 'case_003', title: 'CT C-Spine - Theo dõi điều trị', description: 'So sánh CT cột sống cổ lần 1 và lần 2 - theo dõi sau điều trị', patientId: 'pat_003', patientName: 'Bùi Thế Thiêm', priority: 'critical', status: 'review', assignedTo: 'Dr. Đỗ Bảo Ngọc', studyIds: ['std_004', 'std_005'], taxonomyTags: ['C-Spine', 'Follow-up', 'CT Contrast'], slaDeadline: '2026-03-24T12:00:00Z', createdBy: 'Nguyễn Thị Lan', createdAt: '2023-06-05T12:00:00Z', updatedAt: '2026-03-23T08:00:00Z' },
];

export const mockTasks: Task[] = [
  { id: 'task_001', caseId: 'case_001', caseTitle: 'CT C-Spine - Đánh giá áp xe', patientName: 'Bùi Trọng Tình', type: 'annotate', status: 'in_progress', assignedTo: 'Nguyễn Thị Mai', priority: 'high', studyUid: '1.2.840.113704.1.111.13428.1678778829.1', modality: 'CT', slaDeadline: '2026-03-25T18:00:00Z', createdAt: '2023-03-14T14:30:00Z' },
  { id: 'task_002', caseId: 'case_001', caseTitle: 'CT C-Spine - Đánh giá áp xe', patientName: 'Bùi Trọng Tình', type: 'review', status: 'created', assignedTo: null, priority: 'high', studyUid: '1.2.840.113704.1.111.11228.1696305185.1', modality: 'CT', slaDeadline: '2026-03-25T18:00:00Z', createdAt: '2026-03-23T09:00:00Z' },
  { id: 'task_003', caseId: 'case_002', caseTitle: 'CT Hàm-Mặt - Đánh giá tổn thương', patientName: 'Bùi Viết Lâm', type: 'annotate', status: 'assigned', assignedTo: 'Nguyễn Thị Mai', priority: 'normal', studyUid: '1.2.840.113704.1.111.9072.1552979082.1', modality: 'CT', slaDeadline: null, createdAt: '2019-03-19T14:30:00Z' },
  { id: 'task_004', caseId: 'case_003', caseTitle: 'CT C-Spine - Theo dõi điều trị', patientName: 'Bùi Thế Thiêm', type: 'annotate', status: 'in_review', assignedTo: 'Dr. Đỗ Bảo Ngọc', priority: 'critical', studyUid: '1.2.840.113704.1.111.9500.1681976622.1', modality: 'CT', slaDeadline: '2026-03-24T12:00:00Z', createdAt: '2023-06-05T12:30:00Z' },
  { id: 'task_005', caseId: 'case_003', caseTitle: 'CT C-Spine - Theo dõi điều trị', patientName: 'Bùi Thế Thiêm', type: 'diagnose', status: 'created', assignedTo: null, priority: 'critical', studyUid: '1.2.840.113704.1.111.5364.1685941505.1', modality: 'CT', slaDeadline: '2026-03-24T12:00:00Z', createdAt: '2026-03-23T10:00:00Z' },
];

export const dashboardStats = {
  totalPatients: 3,
  totalCases: 3,
  activeTasks: 4,
  completedToday: 0,
  pendingReview: 1,
  slaAtRisk: 1,
};
