import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding MedicalPower database...\n');

  // 1. Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'bv-thong-nhat' },
    update: {},
    create: {
      name: 'Bệnh viện Thống Nhất',
      slug: 'bv-thong-nhat',
      type: 'hospital',
      settings: { region: 'HCM', tier: 'central' },
    },
  });
  console.log(`✓ Organization: ${org.name}`);

  // 2. Facility
  const facility = await prisma.facility.upsert({
    where: { id: org.id + '-main' },
    update: {},
    create: {
      id: org.id + '-main',
      organizationId: org.id,
      name: 'Cơ sở chính - 1 Lý Thường Kiệt',
      address: '1 Lý Thường Kiệt, Q. Tân Bình, TP.HCM',
      dicomwebEndpoint: 'http://localhost:8042/dicom-web',
    },
  });
  console.log(`✓ Facility: ${facility.name}`);

  // 3. Department
  const deptRadiology = await prisma.department.create({
    data: {
      facilityId: facility.id,
      name: 'Khoa Chẩn đoán Hình ảnh',
      specialtyCode: 'RAD',
    },
  });
  console.log(`✓ Department: ${deptRadiology.name}`);

  // 4. Roles
  const roleNames = [
    { name: 'system_admin', description: 'Quản trị hệ thống' },
    { name: 'org_admin', description: 'Quản trị tổ chức' },
    { name: 'clinical_lead', description: 'Trưởng nhóm lâm sàng' },
    { name: 'radiologist', description: 'Bác sĩ chẩn đoán hình ảnh' },
    { name: 'annotator', description: 'Kỹ thuật viên chú thích' },
    { name: 'qa_reviewer', description: 'Chuyên viên kiểm tra chất lượng' },
    { name: 'data_scientist', description: 'Chuyên viên dữ liệu AI' },
    { name: 'viewer', description: 'Chỉ xem' },
  ];

  const roles: Record<string, string> = {};
  for (const r of roleNames) {
    const role = await prisma.role.create({
      data: { ...r, organizationId: org.id, permissions: [] },
    });
    roles[r.name] = role.id;
  }
  console.log(`✓ Roles: ${roleNames.length} roles created`);

  // 5. Users
  const userAdmin = await prisma.user.create({
    data: {
      email: 'admin@medicalpower.dev',
      fullName: 'Admin Hệ thống',
      organizationId: org.id,
      departmentId: deptRadiology.id,
    },
  });
  await prisma.userRole.create({ data: { userId: userAdmin.id, roleId: roles['system_admin'] } });

  const userLead = await prisma.user.create({
    data: {
      email: 'lead@medicalpower.dev',
      fullName: 'Nguyễn Thị Lan',
      organizationId: org.id,
      departmentId: deptRadiology.id,
    },
  });
  await prisma.userRole.create({ data: { userId: userLead.id, roleId: roles['clinical_lead'] } });

  const userAnnotator = await prisma.user.create({
    data: {
      email: 'annotator@medicalpower.dev',
      fullName: 'Nguyễn Thị Mai',
      organizationId: org.id,
      departmentId: deptRadiology.id,
    },
  });
  await prisma.userRole.create({ data: { userId: userAnnotator.id, roleId: roles['annotator'] } });

  const userRadiologist = await prisma.user.create({
    data: {
      email: 'radiologist@medicalpower.dev',
      fullName: 'Dr. Đỗ Bảo Ngọc',
      organizationId: org.id,
      departmentId: deptRadiology.id,
    },
  });
  await prisma.userRole.create({ data: { userId: userRadiologist.id, roleId: roles['radiologist'] } });
  await prisma.userRole.create({ data: { userId: userRadiologist.id, roleId: roles['qa_reviewer'] } });

  console.log('✓ Users: 4 users created');

  // 6. Patients (real clinical data — BV Thống Nhất)
  const patBuiTinh = await prisma.patient.create({
    data: {
      mrn: '23057406',
      fullName: 'Bùi Trọng Tình',
      dob: new Date('1984-02-29'),
      gender: 'male',
      phone: '+84 909 000 001',
      address: 'TP.HCM',
      organizationId: org.id,
    },
  });

  const patBuiLam = await prisma.patient.create({
    data: {
      mrn: '15122510',
      fullName: 'Bùi Viết Lâm',
      dob: new Date('1970-01-01'),
      gender: 'male',
      phone: '+84 908 234 567',
      address: 'TP.HCM',
      organizationId: org.id,
    },
  });

  const patBuiThiem = await prisma.patient.create({
    data: {
      mrn: '13093945',
      fullName: 'Bùi Thế Thiêm',
      dob: new Date('1965-01-01'),
      gender: 'male',
      phone: '+84 912 345 678',
      address: 'TP.HCM',
      organizationId: org.id,
    },
  });

  console.log('✓ Patients: 3 patients created (real clinical data)');

  // 7. Studies (DICOM metadata cache — matches actual Orthanc data)
  const studyTinh1 = await prisma.study.create({
    data: {
      studyInstanceUid: '1.2.840.113704.1.111.13428.1678778829.1',
      patientId: patBuiTinh.id,
      modality: 'CT',
      studyDate: new Date('2023-03-14'),
      description: 'CT cột sống cổ có tiêm thuốc cản quang',
      accessionNumber: '1575267',
      institutionName: 'BV THONG NHAT',
      referringPhysician: 'Do Bao Ngoc',
      bodyPart: 'C-SPINE',
      numSeries: 1,
      numInstances: 598,
    },
  });

  const studyTinh2 = await prisma.study.create({
    data: {
      studyInstanceUid: '1.2.840.113704.1.111.11228.1696305185.1',
      patientId: patBuiTinh.id,
      modality: 'CT',
      studyDate: new Date('2023-10-03'),
      description: 'CT cột sống cổ có tiêm thuốc cản quang (tái khám)',
      accessionNumber: '1780735',
      institutionName: 'BV THONG NHAT',
      referringPhysician: 'Nguyen Thi Dai Dong',
      bodyPart: 'C-SPINE',
      numSeries: 1,
      numInstances: 520,
    },
  });

  const studyLam = await prisma.study.create({
    data: {
      studyInstanceUid: '1.2.840.113704.1.111.9072.1552979082.1',
      patientId: patBuiLam.id,
      modality: 'CT',
      studyDate: new Date('2019-03-19'),
      description: 'CT hàm-mặt có tiêm thuốc cản quang',
      accessionNumber: '800660',
      institutionName: 'BV THONG NHAT',
      referringPhysician: 'Que Lan Huong',
      bodyPart: 'FACE',
      numSeries: 1,
      numInstances: 341,
    },
  });

  const studyThiem1 = await prisma.study.create({
    data: {
      studyInstanceUid: '1.2.840.113704.1.111.9500.1681976622.1',
      patientId: patBuiThiem.id,
      modality: 'CT',
      studyDate: new Date('2023-04-20'),
      description: 'CT cột sống cổ có tiêm thuốc cản quang',
      accessionNumber: '1603264',
      institutionName: 'BV THONG NHAT',
      referringPhysician: 'Truong Hoang Viet',
      bodyPart: 'C-SPINE',
      numSeries: 1,
      numInstances: 457,
    },
  });

  const studyThiem2 = await prisma.study.create({
    data: {
      studyInstanceUid: '1.2.840.113704.1.111.5364.1685941505.1',
      patientId: patBuiThiem.id,
      modality: 'CT',
      studyDate: new Date('2023-06-05'),
      description: 'CT cột sống cổ có tiêm thuốc cản quang (tái khám)',
      accessionNumber: '240000000000012909',
      institutionName: 'BV THONG NHAT',
      referringPhysician: 'Truong Hoang Viet',
      bodyPart: 'C-SPINE',
      numSeries: 1,
      numInstances: 487,
    },
  });

  console.log('✓ Studies: 5 studies created (real DICOM data)');

  // 8. Taxonomy
  const taxAbscess = await prisma.taxonomy.create({
    data: { type: 'disease', code: 'ABSCESS', nameVi: 'Áp xe', nameEn: 'Abscess', organizationId: org.id },
  });
  const taxCSpine = await prisma.taxonomy.create({
    data: { type: 'anatomy', code: 'C_SPINE', nameVi: 'Cột sống cổ', nameEn: 'Cervical Spine', organizationId: org.id },
  });
  const taxBrainTumor = await prisma.taxonomy.create({
    data: { type: 'disease', code: 'BRAIN_TUMOR', nameVi: 'U não', nameEn: 'Brain Tumor', organizationId: org.id },
  });
  const taxLiver = await prisma.taxonomy.create({
    data: { type: 'anatomy', code: 'LIVER', nameVi: 'Gan', nameEn: 'Liver', organizationId: org.id },
  });
  console.log('✓ Taxonomy: 4 entries created');

  // 9. Cases (matching real patient/study data)
  const case1 = await prisma.case.create({
    data: {
      title: 'CT C-Spine - Đánh giá áp xe',
      description: 'Đánh giá áp xe cột sống cổ trên CT có tiêm thuốc cản quang - BV Thống Nhất (lần 1)',
      patientId: patBuiTinh.id,
      organizationId: org.id,
      priority: 'high',
      status: 'in_progress',
      createdById: userLead.id,
      slaDeadline: new Date('2026-03-25T18:00:00Z'),
    },
  });
  await prisma.caseStudyLink.create({
    data: { caseId: case1.id, studyId: studyTinh1.id, role: 'primary' },
  });
  await prisma.caseStudyLink.create({
    data: { caseId: case1.id, studyId: studyTinh2.id, role: 'comparison' },
  });

  const case2 = await prisma.case.create({
    data: {
      title: 'CT Hàm-Mặt - Đánh giá tổn thương',
      description: 'Đánh giá tổn thương hàm-mặt trên CT có tiêm thuốc cản quang',
      patientId: patBuiLam.id,
      organizationId: org.id,
      priority: 'normal',
      status: 'open',
      createdById: userRadiologist.id,
    },
  });
  await prisma.caseStudyLink.create({
    data: { caseId: case2.id, studyId: studyLam.id, role: 'primary' },
  });

  const case3 = await prisma.case.create({
    data: {
      title: 'CT C-Spine - Theo dõi điều trị',
      description: 'So sánh CT cột sống cổ lần 1 và lần 2 - theo dõi sau điều trị',
      patientId: patBuiThiem.id,
      organizationId: org.id,
      priority: 'critical',
      status: 'review',
      createdById: userLead.id,
      slaDeadline: new Date('2026-03-24T12:00:00Z'),
    },
  });
  await prisma.caseStudyLink.create({
    data: { caseId: case3.id, studyId: studyThiem1.id, role: 'primary' },
  });
  await prisma.caseStudyLink.create({
    data: { caseId: case3.id, studyId: studyThiem2.id, role: 'follow_up' },
  });

  console.log('✓ Cases: 3 cases created (linked to real studies)');

  // 10. Tasks
  await prisma.task.create({
    data: {
      caseId: case1.id,
      type: 'annotate',
      status: 'in_progress',
      assignedToId: userAnnotator.id,
      assignedAt: new Date(),
      startedAt: new Date(),
      priority: 'high',
      slaDeadline: new Date('2026-03-22T18:00:00Z'),
    },
  });

  await prisma.task.create({
    data: {
      caseId: case2.id,
      type: 'review',
      status: 'in_review',
      assignedToId: userRadiologist.id,
      assignedAt: new Date(),
      priority: 'critical',
      slaDeadline: new Date('2026-03-21T12:00:00Z'),
    },
  });

  await prisma.task.create({
    data: {
      caseId: case3.id,
      type: 'annotate',
      status: 'assigned',
      assignedToId: userAnnotator.id,
      assignedAt: new Date(),
      priority: 'normal',
    },
  });

  await prisma.task.create({
    data: {
      caseId: case2.id,
      type: 'diagnose',
      status: 'created',
      priority: 'critical',
    },
  });

  console.log('✓ Tasks: 4 tasks created');

  // 11. AI Models
  await prisma.aIModel.create({
    data: {
      name: 'segmentation',
      description: 'Multi-organ segmentation (SegResNet)',
      modality: 'CT',
      taskType: 'segmentation',
      framework: 'monai',
      versions: {
        create: {
          version: 'v1.0.0',
          status: 'active',
          metrics: { dice: 0.89, hausdorff: 3.2 },
        },
      },
    },
  });

  await prisma.aIModel.create({
    data: {
      name: 'deepedit',
      description: 'Interactive segmentation (DeepEdit)',
      modality: 'CT',
      taskType: 'segmentation',
      framework: 'monai',
      versions: {
        create: {
          version: 'v1.0.0',
          status: 'active',
          metrics: { dice: 0.91 },
        },
      },
    },
  });

  console.log('✓ AI Models: 2 models with versions created');

  // 12. Workflow Templates
  await prisma.workflowTemplate.create({
    data: {
      name: 'Gán nhãn & Duyệt',
      description: 'Quy trình chuẩn bệnh viện: Tiếp nhận → AI hỗ trợ gán nhãn → Bác sĩ chú thích → Trưởng khoa duyệt → Hoàn thành.',
      version: '1.0.0',
      organizationId: org.id,
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
    },
  });

  await prisma.workflowTemplate.create({
    data: {
      name: 'Chẩn đoán & Báo cáo',
      description: 'Quy trình chẩn đoán: AI phân tích → Bác sĩ chẩn đoán → Hội chẩn (nếu cần) → Viết báo cáo → Phê duyệt.',
      version: '1.0.0',
      organizationId: org.id,
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
    },
  });

  console.log('✓ Workflow Templates: 2 templates created');

  console.log('\n✅ Seed complete!');
  console.log(`   Organization: ${org.name}`);
  console.log('   Patients: 3 | Studies: 5 | Cases: 3 | Tasks: 4 | Workflows: 2');
  console.log('   Users: 4 | Roles: 8 | AI Models: 2');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
