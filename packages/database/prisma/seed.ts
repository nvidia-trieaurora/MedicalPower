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

  console.log('\n✅ Seed complete!');
  console.log(`   Organization: ${org.name}`);
  console.log('   Patients: 3 (real) | Studies: 5 (real DICOM) | Cases: 3 | Tasks: 4');
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
