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
  { id: 'pat_001', mrn: 'VN-HCM-2026-001234', fullName: 'Nguyễn Văn An', dob: '1985-07-15', gender: 'male', nationalId: '079123456789', phone: '+84 909 123 456', address: '123 Nguyễn Huệ, Q.1, TP.HCM', status: 'active', createdAt: '2026-03-01T08:00:00Z' },
  { id: 'pat_002', mrn: 'VN-HCM-2026-001235', fullName: 'Trần Thị Bích', dob: '1992-03-22', gender: 'female', nationalId: '079234567890', phone: '+84 908 234 567', address: '45 Lê Lợi, Q.3, TP.HCM', status: 'active', createdAt: '2026-03-02T09:30:00Z' },
  { id: 'pat_003', mrn: 'VN-HN-2026-000891', fullName: 'Phạm Minh Cường', dob: '1978-11-08', gender: 'male', nationalId: '001345678901', phone: '+84 912 345 678', address: '78 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội', status: 'active', createdAt: '2026-03-05T14:00:00Z' },
  { id: 'pat_004', mrn: 'VN-DN-2026-000456', fullName: 'Lê Thị Dung', dob: '2001-06-30', gender: 'female', nationalId: '048456789012', phone: '+84 905 456 789', address: '12 Bạch Đằng, Hải Châu, Đà Nẵng', status: 'active', createdAt: '2026-03-10T10:15:00Z' },
  { id: 'pat_005', mrn: 'VN-HCM-2026-001240', fullName: 'Hoàng Đức Em', dob: '1965-01-12', gender: 'male', nationalId: '079567890123', phone: '+84 903 567 890', address: '200 Võ Văn Tần, Q.3, TP.HCM', status: 'active', createdAt: '2026-03-12T07:45:00Z' },
];

export const mockStudies: Study[] = [
  { id: 'std_001', studyInstanceUid: '1.2.840.113654.2.70.1.1001', patientId: 'pat_001', patientName: 'Nguyễn Văn An', modality: 'CT', description: 'CT Chest with Contrast', studyDate: '2026-03-15', numSeries: 4, numInstances: 312 },
  { id: 'std_002', studyInstanceUid: '1.2.840.113654.2.70.1.1002', patientId: 'pat_002', patientName: 'Trần Thị Bích', modality: 'MRI', description: 'MRI Brain without Contrast', studyDate: '2026-03-14', numSeries: 6, numInstances: 180 },
  { id: 'std_003', studyInstanceUid: '1.2.840.113654.2.70.1.1003', patientId: 'pat_003', patientName: 'Phạm Minh Cường', modality: 'CT', description: 'CT Abdomen Pelvis', studyDate: '2026-03-16', numSeries: 3, numInstances: 450 },
  { id: 'std_004', studyInstanceUid: '1.2.840.113654.2.70.1.1004', patientId: 'pat_004', patientName: 'Lê Thị Dung', modality: 'MRI', description: 'MRI Spine Lumbar', studyDate: '2026-03-17', numSeries: 5, numInstances: 200 },
  { id: 'std_005', studyInstanceUid: '1.2.840.113654.2.70.1.1005', patientId: 'pat_005', patientName: 'Hoàng Đức Em', modality: 'CT', description: 'CT Chest Low-dose Screening', studyDate: '2026-03-18', numSeries: 2, numInstances: 150 },
];

export const mockCases: Case[] = [
  { id: 'case_001', title: 'CT Chest - Lung nodule evaluation', description: 'Đánh giá nốt phổi phát hiện trên CT ngực', patientId: 'pat_001', patientName: 'Nguyễn Văn An', priority: 'high', status: 'in_progress', assignedTo: 'Nguyễn Thị Mai', studyIds: ['std_001'], taxonomyTags: ['Lung Nodule', 'CT Chest'], slaDeadline: '2026-03-20T18:00:00Z', createdBy: 'Dr. Trần Văn Bình', createdAt: '2026-03-15T10:00:00Z', updatedAt: '2026-03-18T14:30:00Z' },
  { id: 'case_002', title: 'MRI Brain - Tumor assessment', description: 'Đánh giá khối u não trên MRI', patientId: 'pat_002', patientName: 'Trần Thị Bích', priority: 'critical', status: 'review', assignedTo: 'Dr. Trần Văn Bình', studyIds: ['std_002'], taxonomyTags: ['Brain Tumor', 'MRI'], slaDeadline: '2026-03-19T12:00:00Z', createdBy: 'Nguyễn Thị Lan', createdAt: '2026-03-14T09:00:00Z', updatedAt: '2026-03-19T08:00:00Z' },
  { id: 'case_003', title: 'CT Abdomen - Liver segmentation', description: 'Phân đoạn gan trên CT bụng', patientId: 'pat_003', patientName: 'Phạm Minh Cường', priority: 'normal', status: 'open', assignedTo: null, studyIds: ['std_003'], taxonomyTags: ['Liver', 'Segmentation'], slaDeadline: '2026-03-22T18:00:00Z', createdBy: 'Nguyễn Thị Lan', createdAt: '2026-03-16T14:00:00Z', updatedAt: '2026-03-16T14:00:00Z' },
  { id: 'case_004', title: 'MRI Spine - Disc herniation', description: 'Đánh giá thoát vị đĩa đệm cột sống thắt lưng', patientId: 'pat_004', patientName: 'Lê Thị Dung', priority: 'normal', status: 'draft', assignedTo: null, studyIds: ['std_004'], taxonomyTags: ['Spine', 'Disc'], slaDeadline: null, createdBy: 'Nguyễn Thị Lan', createdAt: '2026-03-17T11:00:00Z', updatedAt: '2026-03-17T11:00:00Z' },
  { id: 'case_005', title: 'CT Chest - Screening follow-up', description: 'Theo dõi sàng lọc ung thư phổi', patientId: 'pat_005', patientName: 'Hoàng Đức Em', priority: 'low', status: 'completed', assignedTo: 'Nguyễn Thị Mai', studyIds: ['std_005'], taxonomyTags: ['Lung Screening', 'Follow-up'], slaDeadline: '2026-03-21T18:00:00Z', createdBy: 'Dr. Trần Văn Bình', createdAt: '2026-03-18T08:00:00Z', updatedAt: '2026-03-19T16:00:00Z' },
];

export const mockTasks: Task[] = [
  { id: 'task_001', caseId: 'case_001', caseTitle: 'CT Chest - Lung nodule evaluation', patientName: 'Nguyễn Văn An', type: 'annotate', status: 'in_progress', assignedTo: 'Nguyễn Thị Mai', priority: 'high', studyUid: '1.2.840.113654.2.70.1.1001', modality: 'CT', slaDeadline: '2026-03-20T18:00:00Z', createdAt: '2026-03-15T10:30:00Z' },
  { id: 'task_002', caseId: 'case_002', caseTitle: 'MRI Brain - Tumor assessment', patientName: 'Trần Thị Bích', type: 'review', status: 'in_review', assignedTo: 'Dr. Trần Văn Bình', priority: 'critical', studyUid: '1.2.840.113654.2.70.1.1002', modality: 'MRI', slaDeadline: '2026-03-19T12:00:00Z', createdAt: '2026-03-18T09:00:00Z' },
  { id: 'task_003', caseId: 'case_003', caseTitle: 'CT Abdomen - Liver segmentation', patientName: 'Phạm Minh Cường', type: 'annotate', status: 'assigned', assignedTo: 'Nguyễn Thị Mai', priority: 'normal', studyUid: '1.2.840.113654.2.70.1.1003', modality: 'CT', slaDeadline: '2026-03-22T18:00:00Z', createdAt: '2026-03-16T14:30:00Z' },
  { id: 'task_004', caseId: 'case_005', caseTitle: 'CT Chest - Screening follow-up', patientName: 'Hoàng Đức Em', type: 'annotate', status: 'completed', assignedTo: 'Nguyễn Thị Mai', priority: 'low', studyUid: '1.2.840.113654.2.70.1.1005', modality: 'CT', slaDeadline: '2026-03-21T18:00:00Z', createdAt: '2026-03-18T08:30:00Z' },
  { id: 'task_005', caseId: 'case_002', caseTitle: 'MRI Brain - Tumor assessment', patientName: 'Trần Thị Bích', type: 'diagnose', status: 'created', assignedTo: null, priority: 'critical', studyUid: '1.2.840.113654.2.70.1.1002', modality: 'MRI', slaDeadline: '2026-03-20T12:00:00Z', createdAt: '2026-03-19T10:00:00Z' },
];

export const dashboardStats = {
  totalPatients: 156,
  totalCases: 89,
  activeTasks: 34,
  completedToday: 12,
  pendingReview: 8,
  slaAtRisk: 3,
};
