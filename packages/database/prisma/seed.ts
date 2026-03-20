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

  // 6. Patients
  const patBui = await prisma.patient.create({
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

  const patTran = await prisma.patient.create({
    data: {
      mrn: 'VN-HCM-2026-001235',
      fullName: 'Trần Thị Bích',
      dob: new Date('1992-03-22'),
      gender: 'female',
      phone: '+84 908 234 567',
      address: '45 Lê Lợi, Q.3, TP.HCM',
      organizationId: org.id,
    },
  });

  const patPham = await prisma.patient.create({
    data: {
      mrn: 'VN-HN-2026-000891',
      fullName: 'Phạm Minh Cường',
      dob: new Date('1978-11-08'),
      gender: 'male',
      phone: '+84 912 345 678',
      address: '78 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội',
      organizationId: org.id,
    },
  });

  const patLe = await prisma.patient.create({
    data: {
      mrn: 'VN-DN-2026-000456',
      fullName: 'Lê Thị Dung',
      dob: new Date('2001-06-30'),
      gender: 'female',
      phone: '+84 905 456 789',
      address: '12 Bạch Đằng, Hải Châu, Đà Nẵng',
      organizationId: org.id,
    },
  });

  const patHoang = await prisma.patient.create({
    data: {
      mrn: 'VN-HCM-2026-001240',
      fullName: 'Hoàng Đức Em',
      dob: new Date('1965-01-12'),
      gender: 'male',
      phone: '+84 903 567 890',
      address: '200 Võ Văn Tần, Q.3, TP.HCM',
      organizationId: org.id,
    },
  });

  console.log('✓ Patients: 5 patients created');

  // 7. Studies (DICOM metadata cache — matches Orthanc data)
  const studyBui = await prisma.study.create({
    data: {
      studyInstanceUid: '1.2.840.113704.1.111.13428.1678778829.1',
      patientId: patBui.id,
      modality: 'CT',
      studyDate: new Date('2023-03-14'),
      description: 'CT cột sống cổ có tiêm thuốc cản quang - Abscess',
      accessionNumber: '1575267',
      institutionName: 'BV THONG NHAT',
      referringPhysician: 'Do Bao Ngoc',
      bodyPart: 'C-SPINE',
      numSeries: 1,
      numInstances: 598,
    },
  });

  const studyTran = await prisma.study.create({
    data: {
      studyInstanceUid: '1.2.840.113654.2.70.1.1002',
      patientId: patTran.id,
      modality: 'MRI',
      studyDate: new Date('2026-03-14'),
      description: 'MRI Brain without Contrast',
      bodyPart: 'BRAIN',
      numSeries: 6,
      numInstances: 180,
    },
  });

  const studyPham = await prisma.study.create({
    data: {
      studyInstanceUid: '1.2.840.113654.2.70.1.1003',
      patientId: patPham.id,
      modality: 'CT',
      studyDate: new Date('2026-03-16'),
      description: 'CT Abdomen Pelvis',
      bodyPart: 'ABDOMEN',
      numSeries: 3,
      numInstances: 450,
    },
  });

  console.log('✓ Studies: 3 studies created');

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

  // 9. Cases
  const case1 = await prisma.case.create({
    data: {
      title: 'CT C-Spine - Abscess evaluation',
      description: 'Đánh giá áp xe cột sống cổ trên CT có tiêm thuốc cản quang - BV Thống Nhất',
      patientId: patBui.id,
      organizationId: org.id,
      priority: 'high',
      status: 'in_progress',
      createdById: userLead.id,
      slaDeadline: new Date('2026-03-22T18:00:00Z'),
    },
  });
  await prisma.caseStudyLink.create({
    data: { caseId: case1.id, studyId: studyBui.id, role: 'primary' },
  });

  const case2 = await prisma.case.create({
    data: {
      title: 'MRI Brain - Tumor assessment',
      description: 'Đánh giá khối u não trên MRI',
      patientId: patTran.id,
      organizationId: org.id,
      priority: 'critical',
      status: 'review',
      createdById: userLead.id,
      slaDeadline: new Date('2026-03-21T12:00:00Z'),
    },
  });
  await prisma.caseStudyLink.create({
    data: { caseId: case2.id, studyId: studyTran.id, role: 'primary' },
  });

  const case3 = await prisma.case.create({
    data: {
      title: 'CT Abdomen - Liver segmentation',
      description: 'Phân đoạn gan trên CT bụng',
      patientId: patPham.id,
      organizationId: org.id,
      priority: 'normal',
      status: 'open',
      createdById: userRadiologist.id,
    },
  });
  await prisma.caseStudyLink.create({
    data: { caseId: case3.id, studyId: studyPham.id, role: 'primary' },
  });

  console.log('✓ Cases: 3 cases created');

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
  console.log('   Patients: 5 | Studies: 3 | Cases: 3 | Tasks: 4');
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
