# MedicalPower — Production-Grade Medical Imaging Annotation & Case Management Platform

**Version:** 1.0.0-draft  
**Date:** 2026-03-19  
**Authors:** Principal Solution Architecture Team  
**Status:** Planning / RFC  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Scope](#2-product-scope)
3. [User Roles and Personas](#3-user-roles-and-personas)
4. [Core Use Cases](#4-core-use-cases)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Proposed System Architecture](#7-proposed-system-architecture)
8. [Technology Stack Recommendation](#8-technology-stack-recommendation)
9. [Module Breakdown](#9-module-breakdown)
10. [Data Model and Domain Design](#10-data-model-and-domain-design)
11. [Workflow Design](#11-workflow-design)
12. [AI/Annotation/Segmentation Design](#12-aiannotationsegmentation-design)
13. [Integration Design](#13-integration-design)
14. [Security, Privacy, and Compliance Considerations](#14-security-privacy-and-compliance-considerations)
15. [Internationalization (i18n) Design](#15-internationalization-i18n-design)
16. [API Design and Service Contracts](#16-api-design-and-service-contracts)
17. [Deployment Architecture](#17-deployment-architecture)
18. [DevOps, Observability, and Operations](#18-devops-observability-and-operations)
19. [Repo / Monorepo Structure](#19-repo--monorepo-structure)
20. [Documentation Set](#20-documentation-set)
21. [Implementation Roadmap](#21-implementation-roadmap)
22. [Risks and Tradeoffs](#22-risks-and-tradeoffs)
23. [Open Questions / Assumptions](#23-open-questions--assumptions)
24. [Appendices](#24-appendices)

---

## 1. Executive Summary

### [VI] Tóm tắt điều hành

MedicalPower là nền tảng quản lý ca bệnh và chú thích hình ảnh y khoa cấp sản xuất, được xây dựng trên OHIF Viewer, MONAI Label, và hệ thống quản lý quy trình làm việc (workflow) chuyên dụng. Nền tảng nhắm tới:

- **Quản lý bệnh nhân, ca bệnh, chẩn đoán** end-to-end
- **Chú thích hình ảnh y khoa hỗ trợ AI** sử dụng mô hình phân đoạn tự động và tương tác (SAM-style, DeepEdit, SegResNet)
- **Quy trình duyệt/QA** đa tầng cho chất lượng chú thích
- **Tích hợp hệ thống bệnh viện** qua DICOM/DICOMweb/FHIR
- **Song ngữ Việt–Anh** xuyên suốt sản phẩm

Kiến trúc module rõ ràng, tách biệt viewer, dịch vụ chú thích, quản lý ca/tác vụ, danh tính/phân quyền, workflow engine, dịch vụ AI suy luận/huấn luyện, và cổng tích hợp.

### [EN] Executive Summary

MedicalPower is a production-grade medical imaging annotation and case management platform built on OHIF Viewer, MONAI Label, and a dedicated workflow management engine. The platform targets:

- **End-to-end patient, case, and diagnosis management**
- **AI-assisted medical image annotation** using automatic and interactive segmentation models (SAM-style, DeepEdit, SegResNet)
- **Multi-tier review/QA workflows** for annotation quality
- **Hospital system integration** via DICOM/DICOMweb/FHIR
- **Bilingual Vietnamese–English** throughout the product

The architecture enforces clear module separation between viewer, annotation services, case/task management, identity/access, workflow engine, AI inference/training services, and integration gateways.

**Key differentiators:**
- Unified portal bridging clinical workflow with AI annotation
- MONAI Label native integration with active learning loop
- Hospital-grade security, audit, and compliance
- Designed for Vietnam healthcare market with full Vietnamese localization

---

## 2. Product Scope

### [VI] Phạm vi sản phẩm

| Phạm vi | Bao gồm | Không bao gồm (v1) |
|---------|----------|---------------------|
| Quản lý bệnh nhân | Đăng ký, tìm kiếm, lịch sử | EMR đầy đủ |
| Quản lý ca bệnh | Tạo, gán, theo dõi, đóng | Lập lịch hẹn |
| Chẩn đoán | Phân loại bệnh, mã ICD, liên kết ca | Kê đơn thuốc |
| Xem ảnh y khoa | OHIF + DICOMweb | 3D rendering nâng cao |
| Chú thích AI | MONAI Label, phân đoạn, đo lường | Huấn luyện on-premise GPU cluster |
| Workflow | Gán việc, QA, duyệt, leo thang | BPM engine phức tạp |
| Tích hợp | DICOMweb, FHIR R4, webhook | HL7v2 parser đầy đủ |
| Song ngữ | Việt, Anh | Ngôn ngữ thứ ba |

### [EN] Product Scope

| Scope | Included | Excluded (v1) |
|-------|----------|----------------|
| Patient management | Registration, search, history | Full EMR |
| Case management | Create, assign, track, close | Appointment scheduling |
| Diagnosis | Disease taxonomy, ICD codes, case linking | Prescription management |
| Medical image viewing | OHIF + DICOMweb | Advanced 3D rendering |
| AI annotation | MONAI Label, segmentation, measurements | On-premise GPU training cluster |
| Workflow | Assignment, QA, review, escalation | Complex BPM engine |
| Integration | DICOMweb, FHIR R4, webhooks | Full HL7v2 parser |
| Bilingual | Vietnamese, English | Third language |

---

## 3. User Roles and Personas

### [VI] Vai trò và hồ sơ người dùng

| Vai trò | Mô tả | Quyền chính |
|---------|--------|-------------|
| **System Admin** | Quản trị hệ thống, cấu hình tenant, quản lý user | Toàn quyền hệ thống |
| **Org Admin** | Quản trị tổ chức/bệnh viện | Quản lý user, khoa, cấu hình tổ chức |
| **Clinical Lead** | Trưởng nhóm lâm sàng, phân công ca | Tạo/gán ca, xem báo cáo |
| **Radiologist** | Bác sĩ chẩn đoán hình ảnh, reviewer chính | Xem ảnh, chú thích, duyệt, chẩn đoán |
| **Annotator** | Kỹ thuật viên chú thích chuyên nghiệp | Chú thích, phân đoạn, gửi duyệt |
| **QA Reviewer** | Chuyên viên kiểm tra chất lượng | Duyệt/từ chối chú thích, ghi nhận sai lệch |
| **Data Scientist** | Quản lý mô hình AI, curation dữ liệu | Quản lý model, xem pipeline huấn luyện |
| **Integration Engineer** | Cấu hình tích hợp hệ thống ngoài | Cấu hình PACS, FHIR endpoint |
| **Viewer Only** | Xem ảnh, không chỉnh sửa | Chỉ đọc |

### [EN] User Roles and Personas

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **System Admin** | System administration, tenant config, user management | Full system access |
| **Org Admin** | Organization/hospital administration | User, department, org config management |
| **Clinical Lead** | Clinical team lead, case assignment | Create/assign cases, view reports |
| **Radiologist** | Diagnostic imaging physician, primary reviewer | View images, annotate, review, diagnose |
| **Annotator** | Professional annotation technician | Annotate, segment, submit for review |
| **QA Reviewer** | Quality assurance specialist | Approve/reject annotations, log discrepancies |
| **Data Scientist** | AI model management, data curation | Model management, training pipeline visibility |
| **Integration Engineer** | External system integration configuration | PACS config, FHIR endpoint setup |
| **Viewer Only** | View images, no editing | Read-only access |

**Persona Example — Annotator (Nguyễn Thị Mai):**
- 28 years old, medical imaging technician at a regional hospital in Ho Chi Minh City
- Processes 40-60 cases/day, primarily chest CT and brain MRI
- Needs Vietnamese UI, fast OHIF load, one-click AI pre-annotation
- Reviews AI segmentation, corrects boundaries, submits for radiologist review
- Expects clear task queue, SLA visibility, and mobile notification when tasks are assigned

---

## 4. Core Use Cases

### [VI] Các ca sử dụng chính

**UC-01: Tiếp nhận ca bệnh mới**
- Actor: Clinical Lead
- Mô tả: Tạo bệnh nhân (hoặc tìm sẵn có), tạo ca bệnh, liên kết study DICOM, gán phân loại bệnh, tạo task chú thích đầu tiên.

**UC-02: Chú thích hỗ trợ AI**
- Actor: Annotator
- Mô tả: Mở task từ hàng đợi, khởi chạy OHIF, yêu cầu AI tiền chú thích (MONAI), xem/chỉnh sửa phân đoạn, lưu artifact, gửi duyệt.

**UC-03: Duyệt QA**
- Actor: QA Reviewer / Radiologist
- Mô tả: Nhận task duyệt, mở OHIF với overlay chú thích, phê duyệt/từ chối/yêu cầu sửa, ghi nhận lý do sai lệch.

**UC-04: Chẩn đoán và báo cáo**
- Actor: Radiologist
- Mô tả: Xem kết quả chú thích đã duyệt, tạo chẩn đoán, liên kết mã ICD, tạo báo cáo chẩn đoán.

**UC-05: Phản hồi mô hình AI**
- Actor: Data Scientist
- Mô tả: Xem chú thích đã được duyệt, chọn dữ liệu huấn luyện, kích hoạt pipeline huấn luyện lại, cập nhật model registry.

**UC-06: Tích hợp PACS/EMR**
- Actor: Integration Engineer
- Mô tả: Cấu hình DICOMweb endpoint, thiết lập FHIR resource mapping, kiểm tra kết nối, theo dõi dữ liệu đồng bộ.

### [EN] Core Use Cases

**UC-01: New Case Intake**
- Actor: Clinical Lead
- Description: Create patient (or find existing), create case, link DICOM study, assign disease taxonomy, create initial annotation task.

**UC-02: AI-Assisted Annotation**
- Actor: Annotator
- Description: Open task from queue, launch OHIF, request AI pre-annotation (MONAI), review/edit segmentation, save artifact, submit for review.

**UC-03: QA Review**
- Actor: QA Reviewer / Radiologist
- Description: Receive review task, open OHIF with annotation overlay, approve/reject/request changes, log discrepancy reasons.

**UC-04: Diagnosis and Reporting**
- Actor: Radiologist
- Description: Review approved annotations, create diagnosis, link ICD codes, generate diagnostic report.

**UC-05: AI Model Feedback**
- Actor: Data Scientist
- Description: Review approved annotations, select training data, trigger retraining pipeline, update model registry.

**UC-06: PACS/EMR Integration**
- Actor: Integration Engineer
- Description: Configure DICOMweb endpoint, set up FHIR resource mapping, test connectivity, monitor data sync.

---

## 5. Functional Requirements

### [VI] Yêu cầu chức năng

#### 5.1 Quản lý bệnh nhân
- FR-PAT-01: Tạo, cập nhật, tìm kiếm bệnh nhân (tên, MRN, ngày sinh)
- FR-PAT-02: Lưu giữ thông tin nhân khẩu, liên hệ, bảo hiểm
- FR-PAT-03: Liên kết bệnh nhân với nhiều visit/encounter
- FR-PAT-04: Hợp nhất bệnh nhân trùng lặp (merge)
- FR-PAT-05: Hỗ trợ identifier đa hệ thống (MRN, national ID, FHIR ID)

#### 5.2 Quản lý ca bệnh
- FR-CASE-01: Tạo ca bệnh liên kết bệnh nhân + study
- FR-CASE-02: Gán trạng thái vòng đời: draft → open → in_progress → review → completed → closed
- FR-CASE-03: Gán phân loại bệnh (taxonomy) và mã ICD
- FR-CASE-04: Gán ưu tiên: critical / high / normal / low
- FR-CASE-05: Gán ca cho nhóm hoặc cá nhân
- FR-CASE-06: Theo dõi SLA mục tiêu

#### 5.3 Xem ảnh y khoa
- FR-IMG-01: Mở OHIF viewer từ context ca bệnh
- FR-IMG-02: Tải study qua DICOMweb (WADO-RS, STOW-RS, QIDO-RS)
- FR-IMG-03: Hiển thị overlay chú thích, phân đoạn, đo lường
- FR-IMG-04: Deep link từ portal sang OHIF với study/series context
- FR-IMG-05: Hỗ trợ MPR, MIP cho CT/MRI

#### 5.4 Chú thích và phân đoạn
- FR-ANN-01: Yêu cầu AI tiền phân đoạn qua MONAI Label
- FR-ANN-02: Chỉnh sửa tương tác (interactive segmentation — click, brush, polygon)
- FR-ANN-03: Lưu artifact phân đoạn dưới dạng DICOM SEG hoặc NIfTI + metadata
- FR-ANN-04: Phiên bản hóa chú thích (AI original vs. human-edited vs. reviewed)
- FR-ANN-05: Ghi provenance: ai, creator, model_version, timestamp
- FR-ANN-06: Đo lường (ruler, area, volume) lưu structured report
- FR-ANN-07: Hỗ trợ đa loại label (organ, lesion, landmark)

#### 5.5 Workflow
- FR-WF-01: Task queue với phân công theo vai trò, kỹ năng, workload
- FR-WF-02: State machine cho task: created → assigned → in_progress → submitted → in_review → approved/rejected → completed
- FR-WF-03: QA double-read và adjudication flow
- FR-WF-04: SLA timer, cảnh báo, leo thang tự động
- FR-WF-05: Lock task khi đang chỉnh sửa, giải phóng khi timeout
- FR-WF-06: Ghi nhật ký chuyển trạng thái đầy đủ

#### 5.6 Chẩn đoán và báo cáo
- FR-DX-01: Tạo chẩn đoán liên kết case, study, annotation
- FR-DX-02: Liên kết mã ICD-10/ICD-11
- FR-DX-03: Tạo báo cáo chẩn đoán có cấu trúc
- FR-DX-04: Xuất báo cáo FHIR DiagnosticReport

#### 5.7 Tích hợp
- FR-INT-01: DICOMweb gateway (QIDO-RS, WADO-RS, STOW-RS)
- FR-INT-02: FHIR R4 resources: Patient, ImagingStudy, DiagnosticReport, Observation
- FR-INT-03: Webhook outbound cho sự kiện case/task
- FR-INT-04: Nhận study push từ PACS qua DICOM C-STORE hoặc DICOMweb STOW

#### 5.8 Quản trị
- FR-ADM-01: Quản lý tenant/organization
- FR-ADM-02: Quản lý user, role, permission
- FR-ADM-03: Quản lý taxonomy bệnh
- FR-ADM-04: Cấu hình workflow template
- FR-ADM-05: Dashboard hoạt động và thống kê

### [EN] Functional Requirements

#### 5.1 Patient Management
- FR-PAT-01: Create, update, search patients (name, MRN, DOB)
- FR-PAT-02: Store demographics, contacts, insurance
- FR-PAT-03: Link patient to multiple visits/encounters
- FR-PAT-04: Patient merge for duplicates
- FR-PAT-05: Multi-system identifiers (MRN, national ID, FHIR ID)

#### 5.2 Case Management
- FR-CASE-01: Create case linking patient + study
- FR-CASE-02: Lifecycle states: draft → open → in_progress → review → completed → closed
- FR-CASE-03: Assign disease taxonomy and ICD codes
- FR-CASE-04: Priority assignment: critical / high / normal / low
- FR-CASE-05: Case assignment to group or individual
- FR-CASE-06: SLA target tracking

#### 5.3 Medical Image Viewing
- FR-IMG-01: Launch OHIF viewer from case context
- FR-IMG-02: Load studies via DICOMweb (WADO-RS, STOW-RS, QIDO-RS)
- FR-IMG-03: Display annotation overlays, segmentation masks, measurements
- FR-IMG-04: Deep link from portal to OHIF with study/series context
- FR-IMG-05: MPR, MIP support for CT/MRI

#### 5.4 Annotation and Segmentation
- FR-ANN-01: Request AI pre-segmentation via MONAI Label
- FR-ANN-02: Interactive editing (click, brush, polygon)
- FR-ANN-03: Save segmentation artifacts as DICOM SEG or NIfTI + metadata
- FR-ANN-04: Annotation versioning (AI original vs. human-edited vs. reviewed)
- FR-ANN-05: Record provenance: AI, creator, model_version, timestamp
- FR-ANN-06: Measurements (ruler, area, volume) saved as structured report
- FR-ANN-07: Multi-label support (organ, lesion, landmark)

#### 5.5 Workflow
- FR-WF-01: Task queue with role-based, skill-based, workload-based assignment
- FR-WF-02: Task state machine: created → assigned → in_progress → submitted → in_review → approved/rejected → completed
- FR-WF-03: QA double-read and adjudication flow
- FR-WF-04: SLA timer, alerts, automatic escalation
- FR-WF-05: Task locking during edit, release on timeout
- FR-WF-06: Full state transition audit logging

#### 5.6 Diagnosis and Reporting
- FR-DX-01: Create diagnosis linked to case, study, annotation
- FR-DX-02: ICD-10/ICD-11 code linkage
- FR-DX-03: Structured diagnostic report generation
- FR-DX-04: FHIR DiagnosticReport export

#### 5.7 Integration
- FR-INT-01: DICOMweb gateway (QIDO-RS, WADO-RS, STOW-RS)
- FR-INT-02: FHIR R4 resources: Patient, ImagingStudy, DiagnosticReport, Observation
- FR-INT-03: Outbound webhooks for case/task events
- FR-INT-04: Receive study push from PACS via DICOM C-STORE or DICOMweb STOW

#### 5.8 Administration
- FR-ADM-01: Tenant/organization management
- FR-ADM-02: User, role, permission management
- FR-ADM-03: Disease taxonomy management
- FR-ADM-04: Workflow template configuration
- FR-ADM-05: Activity dashboard and statistics

---

## 6. Non-Functional Requirements

### [VI] Yêu cầu phi chức năng

| Mã | Yêu cầu | Chỉ tiêu |
|----|----------|-----------|
| NFR-01 | Thời gian phản hồi API | p95 < 200ms cho CRUD, p95 < 2s cho AI inference trigger |
| NFR-02 | Thời gian tải OHIF viewer | < 3s initial load, < 1s series switch |
| NFR-03 | Đồng thời | 200 concurrent annotators, 50 concurrent viewers |
| NFR-04 | Uptime | 99.5% (MVP), 99.9% (enterprise) |
| NFR-05 | Bảo mật | Mã hóa TLS 1.3 transit, AES-256 at-rest, RBAC |
| NFR-06 | Audit | Mọi mutation có audit log immutable |
| NFR-07 | Khả năng mở rộng | Horizontal scale cho API, worker, inference |
| NFR-08 | Sao lưu | RPO < 1h, RTO < 4h |
| NFR-09 | i18n | 100% UI strings qua i18n framework, vi + en |
| NFR-10 | Accessibility | WCAG 2.1 AA cho portal web |

### [EN] Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | API response time | p95 < 200ms for CRUD, p95 < 2s for AI inference trigger |
| NFR-02 | OHIF viewer load time | < 3s initial load, < 1s series switch |
| NFR-03 | Concurrency | 200 concurrent annotators, 50 concurrent viewers |
| NFR-04 | Uptime | 99.5% (MVP), 99.9% (enterprise) |
| NFR-05 | Security | TLS 1.3 in transit, AES-256 at rest, RBAC |
| NFR-06 | Audit | All mutations have immutable audit log |
| NFR-07 | Scalability | Horizontal scale for API, worker, inference |
| NFR-08 | Backup | RPO < 1h, RTO < 4h |
| NFR-09 | i18n | 100% UI strings via i18n framework, vi + en |
| NFR-10 | Accessibility | WCAG 2.1 AA for web portal |

---

## 7. Proposed System Architecture

### [VI] Kiến trúc hệ thống đề xuất

Kiến trúc theo mô hình microservice modular, phân tầng rõ ràng:

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │ Portal   │  │ OHIF     │  │ Admin    │                      │
│  │ Web App  │  │ Viewer   │  │ Console  │                      │
│  └──────────┘  └──────────┘  └──────────┘                      │
├─────────────────────────────────────────────────────────────────┤
│                    API GATEWAY (Traefik/Kong)                    │
├─────────────────────────────────────────────────────────────────┤
│                    SERVICE LAYER                                 │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────┐ │
│  │ Identity   │ │ Patient    │ │ Case       │ │ Workflow     │ │
│  │ Service    │ │ Service    │ │ Service    │ │ Service      │ │
│  └────────────┘ └────────────┘ └────────────┘ └──────────────┘ │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────┐ │
│  │ Annotation │ │ Segment.   │ │ Diagnosis  │ │ Report       │ │
│  │ Service    │ │ Service    │ │ Service    │ │ Service      │ │
│  └────────────┘ └────────────┘ └────────────┘ └──────────────┘ │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐                  │
│  │ Notif.     │ │ Audit      │ │ Integration│                  │
│  │ Service    │ │ Service    │ │ Service    │                  │
│  └────────────┘ └────────────┘ └────────────┘                  │
├─────────────────────────────────────────────────────────────────┤
│                    AI / IMAGING LAYER                            │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐                  │
│  │ MONAI      │ │ DICOM      │ │ Object     │                  │
│  │ Label      │ │ Backend    │ │ Storage    │                  │
│  │ Server     │ │ (Orthanc)  │ │ (MinIO)    │                  │
│  └────────────┘ └────────────┘ └────────────┘                  │
├─────────────────────────────────────────────────────────────────┤
│                    PLATFORM LAYER                                │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐ ┌────────────┐ │
│  │Postgres│ │ Redis  │ │Keycloak│ │RabbitMQ  │ │Observability│ │
│  └────────┘ └────────┘ └────────┘ └──────────┘ └────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### [EN] Proposed System Architecture

Architecture follows a modular microservice pattern with clear layering:

**Layer 1 — Client Layer:** Portal Web (Next.js), OHIF Viewer (custom mode/extension), Admin Console  
**Layer 2 — API Gateway:** Traefik or Kong for routing, rate limiting, auth token validation  
**Layer 3 — Service Layer:** 12 backend microservices (NestJS) handling domain logic  
**Layer 4 — AI/Imaging Layer:** MONAI Label server, Orthanc DICOM backend, MinIO object storage  
**Layer 5 — Platform Layer:** PostgreSQL, Redis, Keycloak, RabbitMQ, observability stack (Prometheus + Grafana + Loki)

**Communication patterns:**
- Synchronous: REST/JSON over HTTP between portal ↔ API gateway ↔ services
- Asynchronous: RabbitMQ for event-driven workflows (task created, annotation saved, review completed)
- Streaming: WebSocket for real-time task status and notification updates

---

## 8. Technology Stack Recommendation

### [VI] Khuyến nghị công nghệ

### [EN] Technology Stack Recommendation

#### 8.1 DICOM Backend: Orthanc vs dcm4chee

| Criteria | Orthanc | dcm4chee |
|----------|---------|----------|
| Complexity | Low — single binary, C++, plugin system | High — Java/WildFly, complex config |
| DICOMweb | Full support (plugin) | Native support |
| REST API | Excellent, well-documented | Good, enterprise-grade |
| Community | Active, medical imaging focused | Active, enterprise healthcare |
| MVP suitability | ★★★★★ | ★★★☆☆ |
| Enterprise suitability | ★★★★☆ | ★★★★★ |

**Recommendation: Orthanc**  
**Why:** Faster setup, simpler operations, sufficient DICOMweb support for OHIF. Plugin ecosystem covers common needs (PostgreSQL index, DICOMweb, Python scripting). For enterprise scale (>10M studies), consider dcm4chee migration path.  
**Tradeoff:** Orthanc lacks built-in HL7v2 adapter and some enterprise archival features. Mitigated by integration-service handling protocol translation.

#### 8.2 Workflow Engine: Custom vs Temporal vs Camunda vs n8n

| Criteria | Custom Module | Temporal | Camunda | n8n |
|----------|--------------|----------|---------|-----|
| Clinical workflow fit | ★★★★★ | ★★★★☆ | ★★★★☆ | ★★☆☆☆ |
| Complexity | Medium (own code) | Medium (SDK) | High (BPMN) | Low |
| State machine control | Full control | Full control | BPMN modeling | Limited |
| MVP suitability | ★★★★★ | ★★★☆☆ | ★★☆☆☆ | ★★★★☆ (admin only) |
| Enterprise suitability | ★★★☆☆ | ★★★★★ | ★★★★★ | ★★★☆☆ |

**Recommendation: Custom workflow module (MVP) → Temporal (Phase 4 enterprise)**  
**Why:** Clinical annotation workflows have well-defined state machines. A custom NestJS workflow service with PostgreSQL-backed state machine gives full control and fast iteration for MVP. Temporal adds durable execution guarantees needed at enterprise scale.  
**n8n role:** Use n8n only for non-clinical administrative automation (notification routing, ETL scheduling, integration orchestration). Do NOT couple clinical task state to n8n.  
**Tradeoff:** Custom module requires engineering investment in state machine durability and failure handling. Mitigated by clear state machine design and event sourcing patterns.

#### 8.3 Backend API: FastAPI vs NestJS vs Spring Boot

| Criteria | FastAPI (Python) | NestJS (TypeScript) | Spring Boot (Java) |
|----------|-----------------|--------------------|--------------------|
| Dev speed | ★★★★★ | ★★★★☆ | ★★★☆☆ |
| Type safety | Pydantic | TypeScript decorators | Strong typing |
| Ecosystem | ML/AI native | Full-stack JS | Enterprise Java |
| MONAI integration | Native Python | HTTP client | HTTP client |
| Team availability (VN) | Good | Excellent | Excellent |
| MVP suitability | ★★★★☆ | ★★★★★ | ★★★☆☆ |
| Enterprise suitability | ★★★★☆ | ★★★★☆ | ★★★★★ |

**Recommendation: NestJS for all services EXCEPT AI/inference services (FastAPI)**  
**Why:** NestJS gives full-stack TypeScript alignment with Next.js portal, strong DI/module system, excellent for CRUD-heavy microservices. FastAPI is used specifically for segmentation-service and inference orchestration where Python/MONAI SDK integration is essential.  
**Tradeoff:** Two runtime languages (TypeScript + Python). Mitigated by clear service boundary — only 2 services in Python.

#### 8.4 Frontend Portal: Next.js vs React SPA

| Criteria | Next.js | React SPA |
|----------|---------|-----------|
| SSR/SEO | Yes | No |
| API routes | Built-in BFF | Separate gateway |
| i18n | next-intl mature | react-i18next |
| Auth | NextAuth + middleware | Manual guard |
| MVP suitability | ★★★★★ | ★★★★☆ |
| Enterprise suitability | ★★★★★ | ★★★★☆ |

**Recommendation: Next.js (App Router)**  
**Why:** Server components reduce client bundle, built-in i18n routing, API routes serve as BFF (Backend for Frontend), NextAuth for Keycloak integration. Next.js 15+ App Router is production-stable.  
**Tradeoff:** OHIF viewer runs as a separate React SPA (cannot be SSR'd). Portal and OHIF communicate via URL params and shared auth tokens.

#### 8.5 Auth: Keycloak vs Auth0 vs Custom IAM

| Criteria | Keycloak | Auth0 | Custom |
|----------|----------|-------|--------|
| Self-hosted | Yes | No (SaaS) | Yes |
| OIDC/SAML | Full | Full | DIY |
| Healthcare compliance | ★★★★★ | ★★★★☆ | ★★★☆☆ |
| Cost | Free (OSS) | Per-user pricing | Dev cost |
| MVP suitability | ★★★★☆ | ★★★★★ | ★★☆☆☆ |
| Enterprise suitability | ★★★★★ | ★★★★☆ | ★★★☆☆ |

**Recommendation: Keycloak**  
**Why:** Self-hosted requirement for healthcare data sovereignty (Vietnam regulations). Full OIDC, SAML, RBAC, MFA, identity brokering. Free OSS. Vietnamese hospitals require on-premise/private-cloud deployment.  
**Tradeoff:** Keycloak operations require Java/WildFly expertise. Mitigated by container deployment and established Helm charts.

#### 8.6 Database: PostgreSQL + JSONB vs Document DB

**Recommendation: PostgreSQL + JSONB**  
**Why:** Relational integrity for clinical data (patient, case, diagnosis). JSONB for flexible annotation metadata and FHIR resource storage. pgvector for future ML embedding needs. Battle-tested in healthcare. Row-level security for tenant isolation.  
**Alternative:** MongoDB for annotation artifacts metadata — considered but rejected to avoid operational complexity of two database engines in MVP.

#### 8.7 Queue/Eventing: Redis vs RabbitMQ vs Kafka

**Recommendation: RabbitMQ (primary) + Redis (cache/sessions)**  
**Why:** RabbitMQ provides reliable message delivery with dead-letter queues, sufficient for annotation workflow events (100s-1000s/hour). Redis for caching, session store, and task locking.  
**Enterprise upgrade path:** Kafka for high-throughput event streaming when event volume exceeds 10K/s or event sourcing is required.

#### 8.8 Object Storage for Masks and Derived Artifacts

**Recommendation: MinIO (self-hosted S3-compatible)**  
**Why:** S3-compatible API, self-hosted for data sovereignty, stores segmentation masks (NIfTI, DICOM SEG), derived images, report PDFs. Orthanc stores original DICOM; MinIO stores derived artifacts.  
**Enterprise path:** AWS S3, Azure Blob, or GCS with same API.

#### 8.9 AI Serving: MONAI Label vs MONAI Deploy vs Separate Microservices

| Criteria | MONAI Label Only | MONAI Deploy | Separate Inference MS |
|----------|-----------------|-------------|----------------------|
| Setup | Simple | Complex | Medium |
| Model management | Built-in | Full pipeline | Custom |
| Interactive seg. | Native | Via app | Custom |
| GPU management | Single node | Orchestrated | Custom |
| MVP suitability | ★★★★★ | ★★☆☆☆ | ★★★☆☆ |
| Enterprise | ★★★☆☆ | ★★★★★ | ★★★★☆ |

**Recommendation: MONAI Label (MVP) → MONAI Deploy + inference microservices (enterprise)**  
**Why:** MONAI Label provides everything needed for MVP: REST API, interactive segmentation (DeepEdit), auto-segmentation, active learning, model management. Single Python server with GPU access.  
**Enterprise path:** MONAI Deploy Application Package (MAP) for containerized model deployment, Triton Inference Server for multi-model serving, Kubernetes GPU scheduling.

#### 8.10 Technology Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| Portal Frontend | Next.js + React 19 + TailwindCSS + shadcn/ui | 15.x |
| OHIF Viewer | OHIF Platform v3 | 3.9.x |
| Admin Console | Next.js (shared with portal or separate route group) | 15.x |
| API Gateway | Traefik | 3.x |
| Backend Services | NestJS | 10.x |
| AI/Inference Services | FastAPI + MONAI Label | 0.9.x |
| Auth Provider | Keycloak | 25.x |
| Database | PostgreSQL | 16.x |
| Cache/Lock | Redis | 7.x |
| Message Queue | RabbitMQ | 3.13.x |
| Object Storage | MinIO | latest |
| DICOM Backend | Orthanc + DICOMweb plugin | 1.12.x |
| Observability | Prometheus + Grafana + Loki | latest |
| Container Runtime | Docker + Kubernetes | 1.30.x |
| i18n | next-intl (portal) + nestjs-i18n (backend) | latest |
| ORM | Prisma (NestJS) + SQLAlchemy (FastAPI) | 5.x / 2.x |

---

## 9. Module Breakdown

### [VI] Phân tách module

### [EN] Module Breakdown

#### 9.1 identity-service
- **Purpose:** User authentication, authorization, tenant management
- **Runtime:** Keycloak (external) + thin NestJS adapter
- **Key responsibilities:** OIDC token validation, RBAC enforcement, user profile sync, org/department management
- **Owns:** User, Role, Organization, Facility, Department entities

#### 9.2 patient-service
- **Purpose:** Patient registry, demographics, identifier management
- **Runtime:** NestJS
- **Key responsibilities:** CRUD patients, merge duplicates, FHIR Patient resource mapping
- **Owns:** Patient, PatientIdentifier, Visit/Encounter

#### 9.3 case-service
- **Purpose:** Case lifecycle management, study linkage
- **Runtime:** NestJS
- **Key responsibilities:** Case CRUD, state transitions, priority management, study attachment
- **Owns:** Case, CaseStudyLink

#### 9.4 study-service
- **Purpose:** DICOMweb proxy and study metadata management
- **Runtime:** NestJS
- **Key responsibilities:** DICOMweb proxy to Orthanc, study/series/instance metadata cache, FHIR ImagingStudy mapping
- **Owns:** Study, Series, Instance metadata cache

#### 9.5 annotation-service
- **Purpose:** Annotation session and artifact management
- **Runtime:** NestJS
- **Key responsibilities:** Annotation session lifecycle, artifact CRUD, versioning, provenance tracking
- **Owns:** AnnotationSession, AnnotationArtifact, MeasurementArtifact

#### 9.6 segmentation-service
- **Purpose:** AI inference orchestration, MONAI Label integration
- **Runtime:** FastAPI (Python)
- **Key responsibilities:** Inference request routing, model selection, result storage, active learning coordination
- **Owns:** InferenceJob, SegmentationArtifact
- **Integrates with:** MONAI Label server, MinIO

#### 9.7 workflow-service
- **Purpose:** Task lifecycle, assignment, SLA, escalation
- **Runtime:** NestJS
- **Key responsibilities:** Task state machine, assignment rules engine, SLA tracking, event emission
- **Owns:** Task, WorkflowTemplate, WorkflowRun, ReviewDecision

#### 9.8 diagnosis-service
- **Purpose:** Diagnosis and ICD code management
- **Runtime:** NestJS
- **Key responsibilities:** Diagnosis CRUD, ICD code lookup, taxonomy management
- **Owns:** Diagnosis, Tag/Label/Taxonomy

#### 9.9 report-service
- **Purpose:** Diagnostic report generation and export
- **Runtime:** NestJS
- **Key responsibilities:** Structured report generation, FHIR DiagnosticReport export, PDF generation
- **Owns:** DiagnosticReport

#### 9.10 notification-service
- **Purpose:** Multi-channel notification delivery
- **Runtime:** NestJS
- **Key responsibilities:** Email, in-app, WebSocket push, template management, delivery tracking
- **Owns:** Notification, NotificationTemplate

#### 9.11 audit-service
- **Purpose:** Immutable audit trail
- **Runtime:** NestJS
- **Key responsibilities:** Event ingestion, append-only storage, query API, compliance reporting
- **Owns:** AuditLog

#### 9.12 integration-service
- **Purpose:** External system integration gateway
- **Runtime:** NestJS
- **Key responsibilities:** FHIR client/server, PACS connectivity, webhook management, ETL coordination
- **Owns:** IntegrationConfig, WebhookSubscription, SyncJob

---

## 10. Data Model and Domain Design

### [VI] Mô hình dữ liệu và thiết kế miền

### [EN] Data Model and Domain Design

#### 10.1 Core Entities

**Organization**
- Purpose: Top-level tenant (hospital chain, research institute)
- Key fields: `id`, `name`, `slug`, `type`, `settings` (JSONB), `created_at`
- Relationships: has many Facilities, Users
- Lifecycle: active / suspended / archived

**Facility**
- Purpose: Physical location (hospital, clinic)
- Key fields: `id`, `org_id`, `name`, `address`, `timezone`, `dicomweb_endpoint`
- Relationships: belongs to Organization, has many Departments

**Department**
- Purpose: Clinical department within a facility
- Key fields: `id`, `facility_id`, `name`, `specialty_code`
- Relationships: belongs to Facility, has many Users

**User**
- Purpose: System user (synced from Keycloak)
- Key fields: `id`, `keycloak_id`, `email`, `full_name`, `locale` (vi/en), `org_id`, `department_id`, `status`
- Relationships: belongs to Organization + Department, has many Roles
- Lifecycle: active / inactive / suspended

**Role**
- Purpose: RBAC role definition
- Key fields: `id`, `name`, `permissions` (JSONB), `org_id`
- Relationships: many-to-many with User

**Patient**
- Purpose: Patient registry entry
- Key fields: `id`, `mrn`, `national_id`, `full_name`, `dob`, `gender`, `contact_info` (JSONB), `org_id`
- Relationships: has many Visits, Cases
- Lifecycle: active / merged / deceased

**Visit / Encounter**
- Purpose: Patient visit/encounter event
- Key fields: `id`, `patient_id`, `facility_id`, `visit_date`, `type` (inpatient/outpatient/emergency), `status`
- Relationships: belongs to Patient + Facility, has many Studies

**Study**
- Purpose: DICOM imaging study metadata cache
- Key fields: `id`, `orthanc_id`, `study_instance_uid`, `patient_id`, `visit_id`, `modality`, `study_date`, `description`, `num_series`, `num_instances`, `accession_number`
- Relationships: belongs to Patient + Visit, has many Series
- Note: Source of truth remains in Orthanc; this is a metadata cache

**Series**
- Purpose: DICOM series metadata cache
- Key fields: `id`, `study_id`, `series_instance_uid`, `modality`, `description`, `num_instances`, `body_part`
- Relationships: belongs to Study, has many Instances

**Instance**
- Purpose: DICOM instance metadata (optional caching, typically not materialized)
- Key fields: `id`, `series_id`, `sop_instance_uid`, `instance_number`

**Case**
- Purpose: Clinical annotation/review case
- Key fields: `id`, `patient_id`, `org_id`, `title`, `description`, `priority` (critical/high/normal/low), `status`, `assigned_to`, `assigned_group`, `sla_deadline`, `created_by`, `metadata` (JSONB)
- Relationships: belongs to Patient + Organization, has many Tasks + CaseStudyLinks + Diagnoses
- Lifecycle: draft → open → in_progress → review → completed → closed

**CaseStudyLink**
- Purpose: Many-to-many link between Case and Study
- Key fields: `id`, `case_id`, `study_id`, `role` (primary/comparison/prior)

**Task**
- Purpose: Work item within a workflow
- Key fields: `id`, `case_id`, `workflow_run_id`, `type` (annotate/review/adjudicate/report), `status`, `assigned_to`, `assigned_at`, `started_at`, `completed_at`, `sla_deadline`, `priority`, `locked_by`, `lock_expires_at`
- Relationships: belongs to Case + WorkflowRun, has many AnnotationSessions
- Lifecycle: created → assigned → in_progress → submitted → in_review → approved/rejected → completed

**WorkflowTemplate**
- Purpose: Reusable workflow definition
- Key fields: `id`, `name`, `description`, `version`, `state_machine_def` (JSONB), `assignment_rules` (JSONB), `sla_config` (JSONB), `org_id`
- Relationships: has many WorkflowRuns

**WorkflowRun**
- Purpose: Instance of a workflow template execution
- Key fields: `id`, `template_id`, `case_id`, `status`, `current_state`, `context` (JSONB), `started_at`, `completed_at`
- Relationships: belongs to WorkflowTemplate + Case, has many Tasks
- Lifecycle: running → completed → failed → cancelled

**AnnotationSession**
- Purpose: Single annotation work session by a user
- Key fields: `id`, `task_id`, `user_id`, `study_id`, `started_at`, `ended_at`, `status`, `client_state` (JSONB — viewport state, tool state)
- Relationships: belongs to Task + User + Study, has many Artifacts

**AnnotationArtifact**
- Purpose: Annotation data (contours, landmarks, labels)
- Key fields: `id`, `session_id`, `type` (contour/polygon/landmark/freeform), `label`, `series_id`, `data` (JSONB), `format`, `storage_path`, `version`, `parent_version_id`, `provenance` (JSONB — creator_type: ai/human, model_version, user_id)
- Relationships: belongs to AnnotationSession, self-referential version chain
- Lifecycle: draft → submitted → approved / rejected

**SegmentationArtifact**
- Purpose: Volumetric segmentation mask
- Key fields: `id`, `session_id`, `inference_job_id`, `label`, `series_id`, `format` (nifti/dicom_seg), `storage_path`, `mask_metadata` (JSONB — voxel dims, label map), `version`, `parent_version_id`, `provenance` (JSONB)
- Relationships: belongs to AnnotationSession + InferenceJob
- Lifecycle: ai_generated → human_edited → submitted → approved / rejected

**MeasurementArtifact**
- Purpose: Quantitative measurements (length, area, volume, SUV)
- Key fields: `id`, `session_id`, `type` (length/area/volume/angle/suv), `value`, `unit`, `series_id`, `instance_uid`, `coordinates` (JSONB), `label`
- Relationships: belongs to AnnotationSession

**AIModel**
- Purpose: AI model registry
- Key fields: `id`, `name`, `description`, `modality`, `body_part`, `task_type` (segmentation/classification/detection), `framework` (monai/pytorch/onnx)
- Relationships: has many ModelVersions

**ModelVersion**
- Purpose: Specific version of a model
- Key fields: `id`, `model_id`, `version`, `artifact_path`, `metrics` (JSONB — dice, accuracy), `training_dataset_id`, `status` (training/validating/active/deprecated), `created_at`
- Relationships: belongs to AIModel, has many InferenceJobs
- Lifecycle: training → validating → active → deprecated

**InferenceJob**
- Purpose: Single AI inference execution
- Key fields: `id`, `model_version_id`, `study_id`, `series_id`, `requested_by`, `status` (queued/running/completed/failed), `input_params` (JSONB), `result_path`, `execution_time_ms`, `gpu_device`, `created_at`, `completed_at`
- Relationships: belongs to ModelVersion + Study, produces SegmentationArtifacts
- Lifecycle: queued → running → completed / failed

**Diagnosis**
- Purpose: Clinical diagnosis entry
- Key fields: `id`, `case_id`, `icd_code`, `icd_version` (10/11), `description`, `severity`, `confidence`, `diagnosed_by`, `created_at`
- Relationships: belongs to Case, linked to DiagnosticReport

**DiagnosticReport**
- Purpose: Structured diagnostic report
- Key fields: `id`, `case_id`, `patient_id`, `study_id`, `status` (draft/preliminary/final/amended), `content` (JSONB — structured sections), `fhir_resource` (JSONB), `signed_by`, `signed_at`, `pdf_path`
- Relationships: belongs to Case + Patient + Study
- Lifecycle: draft → preliminary → final → amended

**ReviewDecision**
- Purpose: QA review decision record
- Key fields: `id`, `task_id`, `reviewer_id`, `decision` (approved/rejected/changes_requested), `reason`, `discrepancy_type`, `comments`, `created_at`
- Relationships: belongs to Task

**AuditLog**
- Purpose: Immutable audit trail
- Key fields: `id`, `timestamp`, `actor_id`, `actor_type` (user/system/integration), `action`, `resource_type`, `resource_id`, `old_value` (JSONB), `new_value` (JSONB), `ip_address`, `user_agent`, `org_id`
- Note: Append-only, no updates or deletes

**Notification**
- Purpose: User notification record
- Key fields: `id`, `user_id`, `type` (task_assigned/review_requested/sla_warning/system), `title`, `body`, `channel` (in_app/email/websocket), `read_at`, `created_at`, `metadata` (JSONB)
- Relationships: belongs to User

**Tag / Label / Taxonomy**
- Purpose: Disease taxonomy, annotation label sets, classification tags
- Key fields: `id`, `type` (disease/anatomy/finding), `code`, `name_vi`, `name_en`, `parent_id`, `icd_mapping`, `org_id`
- Relationships: self-referential tree, many-to-many with Case/Diagnosis

#### 10.2 Mermaid ERD

```mermaid
erDiagram
    Organization ||--o{ Facility : has
    Organization ||--o{ User : employs
    Organization ||--o{ Role : defines
    Organization ||--o{ Case : owns
    Organization ||--o{ Taxonomy : manages

    Facility ||--o{ Department : contains
    Facility ||--o{ Visit : hosts

    Department ||--o{ User : assigns

    User }o--o{ Role : has
    User ||--o{ Task : assigned_to
    User ||--o{ AnnotationSession : performs
    User ||--o{ Notification : receives
    User ||--o{ AuditLog : actor

    Patient ||--o{ Visit : visits
    Patient ||--o{ Case : subject_of
    Patient ||--o{ Study : imaged_in

    Visit ||--o{ Study : contains

    Study ||--o{ Series : has
    Study ||--o{ CaseStudyLink : linked_via
    Study ||--o{ InferenceJob : input_for
    Study ||--o{ DiagnosticReport : reported_in

    Series ||--o{ Instance : contains
    Series ||--o{ AnnotationArtifact : annotated_on
    Series ||--o{ SegmentationArtifact : segmented_on

    Case ||--o{ CaseStudyLink : links
    Case ||--o{ Task : has
    Case ||--o{ Diagnosis : diagnosed_as
    Case ||--o{ DiagnosticReport : reported_in
    Case ||--o{ WorkflowRun : executed_by

    CaseStudyLink }o--|| Study : references

    WorkflowTemplate ||--o{ WorkflowRun : instantiates
    WorkflowRun ||--o{ Task : creates

    Task ||--o{ AnnotationSession : contains
    Task ||--o{ ReviewDecision : reviewed_by

    AnnotationSession ||--o{ AnnotationArtifact : produces
    AnnotationSession ||--o{ SegmentationArtifact : produces
    AnnotationSession ||--o{ MeasurementArtifact : produces

    AIModel ||--o{ ModelVersion : versions
    ModelVersion ||--o{ InferenceJob : runs
    InferenceJob ||--o{ SegmentationArtifact : produces

    Taxonomy ||--o{ Taxonomy : parent_child
    Taxonomy }o--o{ Diagnosis : classifies

    AnnotationArtifact ||--o{ AnnotationArtifact : version_chain
    SegmentationArtifact ||--o{ SegmentationArtifact : version_chain
```

#### 10.3 Domain Event List

| Event | Source Service | Consumers |
|-------|---------------|-----------|
| `patient.created` | patient-service | audit-service, integration-service |
| `patient.updated` | patient-service | audit-service, integration-service |
| `patient.merged` | patient-service | case-service, audit-service |
| `case.created` | case-service | workflow-service, audit-service, notification-service |
| `case.status_changed` | case-service | workflow-service, notification-service, audit-service |
| `case.assigned` | case-service | notification-service, audit-service |
| `study.received` | study-service | case-service, audit-service |
| `study.linked_to_case` | case-service | workflow-service, audit-service |
| `task.created` | workflow-service | notification-service, audit-service |
| `task.assigned` | workflow-service | notification-service, audit-service |
| `task.status_changed` | workflow-service | notification-service, audit-service, case-service |
| `task.sla_warning` | workflow-service | notification-service |
| `task.sla_breached` | workflow-service | notification-service, audit-service |
| `annotation.session_started` | annotation-service | audit-service |
| `annotation.artifact_saved` | annotation-service | audit-service |
| `annotation.submitted` | annotation-service | workflow-service, audit-service |
| `segmentation.requested` | segmentation-service | audit-service |
| `segmentation.completed` | segmentation-service | annotation-service, audit-service |
| `segmentation.failed` | segmentation-service | notification-service, audit-service |
| `review.decision_made` | workflow-service | annotation-service, notification-service, audit-service |
| `diagnosis.created` | diagnosis-service | report-service, audit-service |
| `report.finalized` | report-service | integration-service, audit-service |
| `model.version_activated` | segmentation-service | notification-service, audit-service |
| `integration.fhir_exported` | integration-service | audit-service |

#### 10.4 Aggregate Boundaries

| Aggregate Root | Entities Within |
|---------------|-----------------|
| **Organization** | Organization, Facility, Department |
| **Patient** | Patient, PatientIdentifier, Visit |
| **Case** | Case, CaseStudyLink, Diagnosis |
| **WorkflowRun** | WorkflowRun, Task, ReviewDecision |
| **AnnotationSession** | AnnotationSession, AnnotationArtifact, SegmentationArtifact, MeasurementArtifact |
| **AIModel** | AIModel, ModelVersion |
| **InferenceJob** | InferenceJob (standalone) |
| **DiagnosticReport** | DiagnosticReport |

#### 10.5 Data Ownership by Service

| Service | Owned Tables | Read Access |
|---------|-------------|-------------|
| identity-service | User, Role, Organization, Facility, Department | — |
| patient-service | Patient, PatientIdentifier, Visit | User (read) |
| case-service | Case, CaseStudyLink | Patient, Study, User (read) |
| study-service | Study, Series, Instance (cache) | Patient (read) |
| annotation-service | AnnotationSession, AnnotationArtifact, MeasurementArtifact | Task, Study, User (read) |
| segmentation-service | InferenceJob, SegmentationArtifact | AIModel, ModelVersion, Study (read) |
| workflow-service | WorkflowTemplate, WorkflowRun, Task, ReviewDecision | Case, User (read) |
| diagnosis-service | Diagnosis, Taxonomy | Case (read) |
| report-service | DiagnosticReport | Case, Patient, Study, Diagnosis (read) |
| notification-service | Notification, NotificationTemplate | User (read) |
| audit-service | AuditLog | — |
| integration-service | IntegrationConfig, WebhookSubscription, SyncJob | Patient, Study, Report (read) |

---

## 11. Workflow Design

### [VI] Thiết kế quy trình làm việc

### [EN] Workflow Design

#### 11.1 Case Intake Workflow

**Actors:** Clinical Lead, System (auto)  
**Trigger:** Manual case creation OR automatic study arrival from PACS  
**Business Rules:**
- Patient must exist or be created first
- At least one study must be linked
- Priority defaults to "normal" unless overridden
- Taxonomy assignment recommended but not mandatory at intake

**State Machine:**
```mermaid
stateDiagram-v2
    [*] --> draft : create_case
    draft --> open : submit_intake
    open --> in_progress : assign_task
    draft --> cancelled : cancel
    open --> cancelled : cancel
```

**Exception Cases:**
- Duplicate patient detected → prompt merge
- Study not found in PACS → retry with DICOMweb query
- Missing required fields → validation error, stay in draft

**Sequence Diagram:**
```mermaid
sequenceDiagram
    actor CL as Clinical Lead
    participant Portal
    participant PatientSvc as patient-service
    participant CaseSvc as case-service
    participant StudySvc as study-service
    participant WFSvc as workflow-service
    participant NotifSvc as notification-service

    CL->>Portal: Search/create patient
    Portal->>PatientSvc: POST /patients or GET /patients?q=...
    PatientSvc-->>Portal: Patient record

    CL->>Portal: Create case
    Portal->>CaseSvc: POST /cases {patient_id, priority, taxonomy}
    CaseSvc-->>Portal: Case created (draft)

    CL->>Portal: Link study
    Portal->>StudySvc: GET /studies?patient_id=...
    StudySvc-->>Portal: Available studies
    Portal->>CaseSvc: POST /cases/:id/studies {study_id, role}

    CL->>Portal: Submit for annotation
    Portal->>CaseSvc: PATCH /cases/:id {status: "open"}
    CaseSvc->>WFSvc: Event: case.status_changed → open
    WFSvc->>WFSvc: Create WorkflowRun from template
    WFSvc->>WFSvc: Create Task (type: annotate)
    WFSvc->>WFSvc: Auto-assign based on rules
    WFSvc->>NotifSvc: Event: task.assigned
    NotifSvc->>CL: Notification: task created
```

**Audit Requirements:** Log case creation, study linkage, status transitions, assignment

---

#### 11.2 Annotation Workflow

**Actors:** Annotator, AI System (MONAI Label)  
**Trigger:** Task assigned to annotator  
**Business Rules:**
- Task must be locked before editing (30-min auto-release)
- AI pre-annotation is optional, annotator can skip
- All artifacts must reference the session and provenance
- Submission triggers QA review task creation

**State Machine:**
```mermaid
stateDiagram-v2
    [*] --> assigned : task_assigned
    assigned --> in_progress : start_work (lock)
    in_progress --> in_progress : save_draft
    in_progress --> submitted : submit_for_review
    in_progress --> assigned : release_lock (timeout/manual)
    submitted --> in_review : reviewer_picks_up
    in_review --> approved : approve
    in_review --> rejected : reject
    rejected --> assigned : reassign_for_correction
    approved --> completed : finalize
```

**Sequence Diagram:**
```mermaid
sequenceDiagram
    actor Ann as Annotator
    participant Portal
    participant WFSvc as workflow-service
    participant AnnSvc as annotation-service
    participant OHIF
    participant SegSvc as segmentation-service
    participant MONAI as MONAI Label
    participant MinIO
    participant Orthanc

    Ann->>Portal: View task queue
    Portal->>WFSvc: GET /tasks?assigned_to=me&status=assigned
    WFSvc-->>Portal: Task list

    Ann->>Portal: Start task
    Portal->>WFSvc: PATCH /tasks/:id {status: in_progress, locked_by}
    WFSvc-->>Portal: Task locked

    Ann->>Portal: Launch viewer
    Portal->>OHIF: Open with study_uid, task_id, token
    OHIF->>Orthanc: DICOMweb WADO-RS (load study)
    Orthanc-->>OHIF: DICOM data

    Ann->>OHIF: Request AI segmentation
    OHIF->>SegSvc: POST /inference {model_id, study_uid, series_uid}
    SegSvc->>MONAI: POST /infer {model, image}
    MONAI-->>SegSvc: Segmentation mask
    SegSvc->>MinIO: Store mask artifact
    SegSvc->>AnnSvc: Create SegmentationArtifact
    SegSvc-->>OHIF: Segmentation result URL
    OHIF->>OHIF: Render overlay

    Ann->>OHIF: Edit segmentation (brush, polygon)
    Ann->>OHIF: Save annotation
    OHIF->>AnnSvc: POST /annotations {session_id, artifacts[]}
    AnnSvc->>MinIO: Store edited artifacts
    AnnSvc-->>OHIF: Saved

    Ann->>Portal: Submit for review
    Portal->>AnnSvc: PATCH /sessions/:id {status: submitted}
    AnnSvc->>WFSvc: Event: annotation.submitted
    WFSvc->>WFSvc: Create review Task
    WFSvc->>WFSvc: Auto-assign reviewer
```

**Exception Cases:**
- MONAI Label unavailable → annotator proceeds manually, notification to admin
- Lock timeout during active editing → extend lock via heartbeat
- Inference timeout (>30s) → async with polling/WebSocket notification
- Large study (>500 instances) → progressive loading, chunked inference

---

#### 11.3 QA / Review Workflow

**Actors:** QA Reviewer, Radiologist (senior reviewer), Adjudicator  
**Trigger:** Annotation submitted for review  
**Business Rules:**
- Reviewer must not be the same user as annotator (unless configured otherwise)
- Double-read: two independent reviews required before approval (configurable per workflow template)
- Discrepancy between reviewers triggers adjudication step
- Rejection must include reason and discrepancy type

**State Machine:**
```mermaid
stateDiagram-v2
    [*] --> pending_review : annotation_submitted
    pending_review --> first_review : reviewer_1_starts
    first_review --> pending_second_review : reviewer_1_completes
    first_review --> changes_requested : reviewer_1_rejects
    pending_second_review --> second_review : reviewer_2_starts
    second_review --> agreed_approved : both_approve
    second_review --> disagreement : reviewers_disagree
    disagreement --> adjudication : assign_adjudicator
    adjudication --> final_approved : adjudicator_approves
    adjudication --> final_rejected : adjudicator_rejects
    changes_requested --> pending_review : annotator_resubmits
    agreed_approved --> [*]
    final_approved --> [*]
    final_rejected --> [*]
```

**Sequence Diagram:**
```mermaid
sequenceDiagram
    actor Rev1 as Reviewer 1
    actor Rev2 as Reviewer 2
    actor Adj as Adjudicator
    participant Portal
    participant WFSvc as workflow-service
    participant AnnSvc as annotation-service
    participant OHIF

    Rev1->>Portal: Pick review task
    Portal->>WFSvc: PATCH /tasks/:id {status: in_review}
    Rev1->>OHIF: Open with annotation overlay
    OHIF->>AnnSvc: GET /annotations?session_id=...
    Rev1->>Portal: Submit decision (approve)
    Portal->>WFSvc: POST /reviews {task_id, decision: approved}

    WFSvc->>WFSvc: Check double-read config → need second review
    WFSvc->>WFSvc: Create second review task

    Rev2->>Portal: Pick second review task
    Rev2->>OHIF: Review annotations
    Rev2->>Portal: Submit decision (reject, reason: boundary_inaccurate)
    Portal->>WFSvc: POST /reviews {task_id, decision: rejected, reason}

    WFSvc->>WFSvc: Disagreement detected → create adjudication task
    Adj->>Portal: Pick adjudication task
    Adj->>OHIF: Compare both reviews
    Adj->>Portal: Final decision (approve with notes)
    Portal->>WFSvc: POST /reviews {task_id, decision: approved, is_adjudication: true}
    WFSvc->>WFSvc: Mark annotation as approved
    WFSvc->>AnnSvc: Event: review.decision_made (approved)
```

**Discrepancy Types:** boundary_inaccurate, label_incorrect, missing_structure, false_positive, false_negative, quality_insufficient

**Audit Requirements:** Every review decision logged with reviewer, timestamp, decision, reason, viewed artifacts

---

#### 11.4 Collaborative Annotation Workflow

**Actors:** Multiple Annotators  
**Trigger:** Complex case requiring multi-annotator input  
**Business Rules:**
- Each annotator works on assigned series/structures (partition by label or series)
- Pessimistic locking: one user per task at a time
- Merge strategy: union of non-overlapping labels, conflict resolution for overlapping
- Task reassignment by Clinical Lead when annotator is unavailable

**State Machine:**
```mermaid
stateDiagram-v2
    [*] --> partitioned : case_requires_collaboration
    partitioned --> sub_task_1_assigned : assign_annotator_1
    partitioned --> sub_task_2_assigned : assign_annotator_2
    sub_task_1_assigned --> sub_task_1_in_progress : start
    sub_task_2_assigned --> sub_task_2_in_progress : start
    sub_task_1_in_progress --> sub_task_1_submitted : submit
    sub_task_2_in_progress --> sub_task_2_submitted : submit
    sub_task_1_submitted --> merging : all_submitted
    sub_task_2_submitted --> merging : all_submitted
    merging --> merged_review : merge_complete
    merged_review --> approved : review_pass
    merged_review --> conflict_resolution : merge_conflict
    conflict_resolution --> merged_review : resolved
    approved --> [*]
```

**Locking Rules:**
- Lock acquired on task start, released on submit or timeout (30 min default)
- Heartbeat every 5 min extends lock
- Force-release by Clinical Lead for stuck locks
- WebSocket notification when lock is released

---

#### 11.5 Training Feedback Workflow

**Actors:** Data Scientist, System (auto)  
**Trigger:** Annotations approved with high quality score  

**Business Rules:**
- Only approved annotations from adjudicated or double-read reviews qualify
- Data scientist curates candidates in a training queue
- De-identification required before model training
- Model version tracked with training dataset reference
- A/B comparison between model versions before activation

**State Machine:**
```mermaid
stateDiagram-v2
    [*] --> candidate : annotation_approved
    candidate --> curated : data_scientist_approves
    candidate --> excluded : data_scientist_excludes
    curated --> de_identified : de_identification_complete
    de_identified --> training_dataset : added_to_dataset
    training_dataset --> training : training_triggered
    training --> validating : training_complete
    validating --> model_active : validation_pass
    validating --> model_rejected : validation_fail
    model_active --> [*]
```

**Sequence Diagram:**
```mermaid
sequenceDiagram
    actor DS as Data Scientist
    participant Portal
    participant SegSvc as segmentation-service
    participant AnnSvc as annotation-service
    participant MONAI as MONAI Label
    participant MinIO

    AnnSvc->>SegSvc: Event: annotation.approved (high quality)
    SegSvc->>SegSvc: Add to training candidates queue

    DS->>Portal: View training candidates
    Portal->>SegSvc: GET /training/candidates
    DS->>Portal: Curate: approve/exclude candidates
    Portal->>SegSvc: PATCH /training/candidates/:id {status}

    DS->>Portal: Trigger de-identification
    Portal->>SegSvc: POST /training/datasets {candidate_ids}
    SegSvc->>MinIO: Copy + de-identify artifacts

    DS->>Portal: Trigger training
    Portal->>SegSvc: POST /training/runs {dataset_id, model_id, config}
    SegSvc->>MONAI: POST /train {dataset, config}
    MONAI-->>SegSvc: Training complete, metrics
    SegSvc->>SegSvc: Create ModelVersion (status: validating)

    DS->>Portal: Review metrics, activate model
    Portal->>SegSvc: PATCH /models/:id/versions/:v {status: active}
```

---

#### 11.6 Operational Workflow

**Actors:** System (auto), Org Admin, Clinical Lead  
**Trigger:** Timer-based, threshold-based  

**SLA Reminders:**
- Warning at 75% of SLA deadline
- Critical alert at 90% of SLA deadline
- Breach notification at 100% + escalation to Clinical Lead

**Escalation Rules:**
1. Task unassigned > 2 hours → auto-assign to next available by workload
2. Task in_progress > SLA threshold → warn assigned user
3. Task in_progress > SLA breach → escalate to Clinical Lead
4. Task stuck (no heartbeat > 1 hour) → release lock, notify

**Status Dashboards:**
- Real-time task distribution by status, priority, department
- SLA compliance rate (% within target)
- Annotator productivity (tasks/day, avg annotation time)
- AI model performance (dice score trends, inference latency)
- Queue depth and wait time

---

## 12. AI/Annotation/Segmentation Design

### [VI] Thiết kế AI / Chú thích / Phân đoạn

### [EN] AI/Annotation/Segmentation Design

#### 12.1 MONAI Label Integration Architecture

MONAI Label operates as a standalone Python server with GPU access. The segmentation-service (FastAPI) acts as a thin orchestration layer between the portal/OHIF and MONAI Label.

```
Portal / OHIF ──► segmentation-service (FastAPI) ──► MONAI Label Server ──► GPU
                          │                                │
                          ▼                                ▼
                    MinIO (artifacts)              Model registry
```

**MONAI Label capabilities used:**
- **Auto-segmentation:** DeepEdit, SegResNet, SwinUNETR for organ/lesion segmentation
- **Interactive segmentation:** Click-based (DeepEdit foreground/background clicks), scribble-based
- **Active learning:** Scoring strategies (epistemic uncertainty, random) for selecting next-best training samples
- **Multi-model support:** Multiple models loaded simultaneously, model selection per inference request

#### 12.2 Supported AI Workflows

| Workflow | Model Type | Input | Output | Latency Target |
|----------|-----------|-------|--------|----------------|
| Auto-segment organ | SegResNet / SwinUNETR | Full volume (CT/MRI) | Multi-label mask | < 10s |
| Auto-segment lesion | DeepEdit | Full volume | Binary/multi-label mask | < 10s |
| Interactive segment | DeepEdit | Volume + click points | Refined mask | < 2s |
| SAM-style segment | SAM-Med3D (future) | Volume + prompt | Mask | < 3s |
| Classification | Custom CNN | Volume/series | Label + confidence | < 5s |

#### 12.3 Model Versioning and Registry

```
AIModel (e.g., "liver-segmentation")
  ├── ModelVersion v1.0.0 (status: deprecated)
  ├── ModelVersion v1.1.0 (status: active, production)
  └── ModelVersion v2.0.0-beta (status: validating)
```

- Each ModelVersion stores: training dataset reference, validation metrics (Dice, Hausdorff), training config
- Active version is the default for inference requests
- Shadow mode: new version runs alongside active for comparison without replacing
- Rollback: revert active status to previous version

#### 12.4 Inference Request Flow

```mermaid
sequenceDiagram
    participant Client as OHIF / Portal
    participant SegSvc as segmentation-service
    participant Queue as RabbitMQ
    participant Worker as Inference Worker
    participant MONAI as MONAI Label
    participant MinIO
    participant AnnSvc as annotation-service

    Client->>SegSvc: POST /inference {model_id, study_uid, series_uid, params}
    SegSvc->>SegSvc: Validate request, resolve model version
    SegSvc->>Queue: Enqueue inference job
    SegSvc-->>Client: 202 Accepted {job_id}

    Worker->>Queue: Dequeue job
    Worker->>MONAI: POST /infer/{model} {image, params}
    MONAI-->>Worker: Segmentation result (NIfTI bytes)
    Worker->>MinIO: Store result artifact
    Worker->>SegSvc: Update InferenceJob (completed, result_path)
    Worker->>AnnSvc: Create SegmentationArtifact

    Client->>SegSvc: GET /inference/{job_id} (poll or WebSocket)
    SegSvc-->>Client: {status: completed, artifact_url}
    Client->>MinIO: GET artifact (signed URL)
```

#### 12.5 Artifact Storage Strategy

| Artifact Type | Format | Storage | Access |
|--------------|--------|---------|--------|
| Original DICOM | DICOM | Orthanc | DICOMweb WADO-RS |
| AI segmentation mask | NIfTI (.nii.gz) | MinIO | Signed URL via segmentation-service |
| Human-edited mask | NIfTI (.nii.gz) | MinIO | Signed URL via annotation-service |
| DICOM SEG (for interop) | DICOM SEG | Orthanc | DICOMweb WADO-RS |
| Measurements | JSON | PostgreSQL (annotation-service) | REST API |
| Contour annotations | JSON | PostgreSQL (annotation-service) | REST API |
| Session viewport state | JSON | PostgreSQL (annotation-service) | REST API |

#### 12.6 Provenance Tracking

Every artifact records:
```json
{
  "provenance": {
    "creator_type": "ai | human | human_edited_ai",
    "creator_user_id": "uuid | null",
    "model_id": "uuid | null",
    "model_version": "v1.1.0 | null",
    "inference_job_id": "uuid | null",
    "parent_artifact_id": "uuid | null",
    "created_at": "2026-03-19T10:00:00Z",
    "tool_used": "brush | polygon | auto | deepedit_click",
    "edit_description": "Refined liver boundary in slices 45-62"
  }
}
```

#### 12.7 OHIF Extension for MONAI Integration

Custom OHIF extensions needed:
- **monai-segmentation-panel:** Side panel showing available models, inference request button, result list
- **monai-segmentation-tool:** Cornerstone tool for click-based interactive segmentation (sends click coords to MONAI)
- **annotation-save-extension:** Saves annotation/segmentation state back to annotation-service
- **task-context-extension:** Receives task context (task_id, case_id) from launch URL, displays task info

These live in the OHIF shell app (`/apps/ohif-shell`) as custom mode and extensions.

---

## 13. Integration Design

### [VI] Thiết kế tích hợp

### [EN] Integration Design

#### 13.1 PACS / VNA / DICOM Archive Connectivity

```mermaid
graph LR
    PACS[Hospital PACS] -->|DICOM C-STORE| Orthanc
    PACS -->|DICOMweb STOW-RS| Orthanc
    Orthanc -->|DICOMweb WADO-RS| OHIF
    Orthanc -->|DICOMweb QIDO-RS| StudySvc[study-service]
    StudySvc -->|REST| Portal
```

- **Orthanc** receives studies via C-STORE (legacy PACS) or DICOMweb STOW-RS (modern)
- Orthanc plugin triggers webhook on study received → study-service caches metadata
- Study-service provides portal-friendly REST API wrapping DICOMweb

#### 13.2 FHIR R4 Integration

| FHIR Resource | Direction | Service | Use Case |
|---------------|-----------|---------|----------|
| Patient | Bidirectional | patient-service + integration-service | Patient sync with EMR |
| ImagingStudy | Import | study-service + integration-service | Study metadata from RIS |
| DiagnosticReport | Export | report-service + integration-service | Send reports to EMR |
| Observation | Export | diagnosis-service + integration-service | Finding observations |
| Practitioner | Import | identity-service + integration-service | Clinician directory sync |

#### 13.3 Webhook / Event Bus Architecture

**Outbound webhooks:**
- integration-service manages webhook subscriptions per organization
- Events: `case.completed`, `report.finalized`, `study.received`
- Retry policy: exponential backoff (1s, 2s, 4s, 8s, 16s), max 5 retries
- Signature: HMAC-SHA256 on payload

**Internal event bus (RabbitMQ):**
- Exchange: `medicalpower.events` (topic exchange)
- Routing keys: `{service}.{entity}.{action}` (e.g., `case.case.created`)
- Dead-letter queue for failed processing
- Event schema versioning via `event_version` field

#### 13.4 n8n for Administrative Automation

n8n is deployed as an optional component for non-clinical automation:
- **Study routing:** Auto-route incoming studies to appropriate department/queue based on modality + body part rules
- **Report distribution:** Email/fax finalized reports to referring physicians
- **Data export:** Scheduled CSV/FHIR export to research database
- **Notification escalation:** Complex notification routing rules beyond SLA

n8n connects to the internal event bus (RabbitMQ) and REST APIs. It does NOT manage clinical task state.

---

## 14. Security, Privacy, and Compliance Considerations

### [VI] Bảo mật, Quyền riêng tư, và Tuân thủ

### [EN] Security, Privacy, and Compliance

#### 14.1 RBAC Design

```
Organization
  └── Roles (defined per org)
       ├── system_admin: full access
       ├── org_admin: org-level management
       ├── clinical_lead: case management, assignment
       ├── radiologist: view, annotate, diagnose, review
       ├── annotator: view, annotate, submit
       ├── qa_reviewer: view, review, approve/reject
       ├── data_scientist: model management, training data
       ├── integration_engineer: integration config
       └── viewer: read-only
```

**Permission model:** Resource-based (case, task, patient, study) × Action (create, read, update, delete, assign, review, approve)

#### 14.2 Tenant Isolation

- Organization ID on every data row (enforced by application layer + database triggers)
- PostgreSQL Row-Level Security (RLS) policies as defense-in-depth
- API gateway validates org context from JWT claims
- Cross-org data access impossible at database level

#### 14.3 PHI/PII Handling

- Patient identifiers (name, MRN, DOB, national_id) encrypted at field level using AES-256-GCM
- Encryption keys managed by Vault (HashiCorp) or Kubernetes secrets
- Search on encrypted fields via deterministic encryption for exact match
- De-identification pipeline for AI training: strips DICOM tags per DICOM PS3.15, replaces identifiers with pseudonyms

#### 14.4 Encryption

- **In transit:** TLS 1.3 mandatory for all endpoints (including internal service-to-service)
- **At rest:** PostgreSQL TDE or disk-level encryption, MinIO server-side encryption, Orthanc storage encryption
- **Secrets:** Kubernetes Secrets / Vault for API keys, database credentials, OIDC client secrets

#### 14.5 Audit Logging

Every mutation produces an immutable audit record:
```json
{
  "id": "uuid",
  "timestamp": "2026-03-19T10:00:00Z",
  "actor_id": "uuid",
  "actor_type": "user",
  "action": "annotation.artifact.created",
  "resource_type": "AnnotationArtifact",
  "resource_id": "uuid",
  "org_id": "uuid",
  "old_value": null,
  "new_value": {"label": "liver", "format": "nifti"},
  "ip_address": "10.0.1.55",
  "user_agent": "MedicalPower-Portal/1.0"
}
```

Audit events stored in append-only table (no UPDATE/DELETE permissions). Retention: 7 years (healthcare compliance).

#### 14.6 Security Control Checklist

| Control | Implementation | Priority |
|---------|---------------|----------|
| Authentication | Keycloak OIDC, MFA | P0 |
| Authorization | RBAC + resource-level checks | P0 |
| Tenant isolation | RLS + application enforcement | P0 |
| PHI encryption at rest | AES-256-GCM field-level | P0 |
| TLS everywhere | TLS 1.3, cert-manager | P0 |
| Audit trail | Append-only audit log | P0 |
| Input validation | Zod (frontend), class-validator (NestJS) | P0 |
| Rate limiting | API gateway (Traefik) | P1 |
| CORS policy | Strict origin whitelist | P1 |
| CSP headers | Strict Content-Security-Policy | P1 |
| Dependency scanning | Snyk / Trivy in CI | P1 |
| Image scanning | Trivy for container images | P1 |
| Secret rotation | Vault / K8s secret rotation | P1 |
| Penetration testing | Annual + pre-release | P2 |
| DICOM de-identification | DICOM PS3.15 profile | P1 |
| Backup encryption | AES-256 encrypted backups | P1 |

#### 14.7 Threat Model Summary

| Threat | Impact | Mitigation |
|--------|--------|------------|
| Unauthorized PHI access | High | RBAC, RLS, encryption, audit |
| Cross-tenant data leak | Critical | RLS, org_id enforcement, integration tests |
| Session hijacking | High | Secure cookies, token rotation, MFA |
| DICOM injection (malformed DICOM) | Medium | Orthanc validation, input sanitization |
| Model poisoning (malicious training data) | Medium | Data curation review, provenance tracking |
| API abuse / DDoS | Medium | Rate limiting, WAF, autoscaling |
| Insider threat | High | Audit trail, least privilege, access reviews |

#### 14.8 Audit Event Taxonomy

| Category | Events |
|----------|--------|
| Authentication | login, logout, login_failed, mfa_challenge, token_refresh |
| Patient | patient.created, patient.updated, patient.merged, patient.viewed |
| Case | case.created, case.updated, case.assigned, case.status_changed |
| Annotation | session.started, artifact.created, artifact.updated, session.submitted |
| Review | review.started, review.decision, review.escalated |
| Diagnosis | diagnosis.created, diagnosis.updated, report.finalized |
| AI/Model | inference.requested, inference.completed, model.activated, training.started |
| Admin | user.created, role.changed, org.settings_updated, config.changed |
| Integration | fhir.exported, webhook.sent, study.received |

---

## 15. Internationalization (i18n) Design

### [VI] Thiết kế quốc tế hóa (i18n) cho Tiếng Việt và Tiếng Anh

### [EN] Internationalization (i18n) Design for Vietnamese and English

#### 15.1 Translation Strategy

- **Framework:** `next-intl` for Next.js portal, `nestjs-i18n` for backend error messages and notification templates
- **Approach:** Namespace-based key organization, JSON translation files
- **Process:** Developers write keys in code → default English extracted → Vietnamese translation by medical translator → review by clinical advisor

#### 15.2 Namespace Structure

```
/packages/i18n/
  /locales/
    /vi/
      common.json         # shared: buttons, labels, navigation
      patient.json        # patient module
      case.json           # case module
      annotation.json     # annotation/segmentation module
      workflow.json        # workflow/task module
      diagnosis.json      # diagnosis module
      report.json         # report module
      admin.json          # admin module
      notification.json   # notification templates
      error.json          # error messages
      medical.json        # medical terminology glossary
    /en/
      common.json
      patient.json
      case.json
      annotation.json
      workflow.json
      diagnosis.json
      report.json
      admin.json
      notification.json
      error.json
      medical.json
```

#### 15.3 Locale Negotiation

1. User profile `locale` preference (stored in identity-service)
2. Browser `Accept-Language` header
3. Organization default locale
4. Fallback: `en`

URL pattern: `/{locale}/dashboard`, `/{locale}/cases/:id` (Next.js App Router i18n routing)

#### 15.4 Fallback Rules

- Missing key in `vi` → fallback to `en` → fallback to key name
- Log missing translations in development mode for translator pipeline
- Medical terms may remain in English/Latin even in Vietnamese context (e.g., "DICOM", "CT", "MRI", "SUV")

#### 15.5 Date/Time/Number Formatting

| Format | Vietnamese | English |
|--------|-----------|---------|
| Date | dd/MM/yyyy | MM/dd/yyyy |
| Time | HH:mm | h:mm a |
| DateTime | dd/MM/yyyy HH:mm | MM/dd/yyyy h:mm a |
| Number | 1.234.567,89 | 1,234,567.89 |
| Currency | 1.500.000 ₫ | $1,500,000 |

Use `Intl.DateTimeFormat` and `Intl.NumberFormat` with locale parameter.

#### 15.6 Medical Terminology Glossary Management

- `medical.json` contains domain-specific terms with both display and clinical code:
```json
{
  "medical.anatomy.liver": "Gan",
  "medical.anatomy.lung": "Phổi",
  "medical.anatomy.brain": "Não",
  "medical.finding.tumor": "Khối u",
  "medical.finding.lesion": "Tổn thương",
  "medical.modality.ct": "Chụp cắt lớp vi tính (CT)",
  "medical.modality.mri": "Cộng hưởng từ (MRI)",
  "medical.status.malignant": "Ác tính",
  "medical.status.benign": "Lành tính"
}
```
- Admin UI for glossary management (add/edit terms)
- Export/import glossary for translation teams

#### 15.7 Hardcoded String Prevention

- ESLint rule: `no-raw-text` (react/jsx-no-literals) — warns on hardcoded strings in JSX
- CI check: scan for untranslated strings
- Code review checklist: "All user-visible strings use i18n keys"

#### 15.8 Example Translation JSON

**en/patient.json:**
```json
{
  "patient.title": "Patient Management",
  "patient.create": "Create Patient",
  "patient.search": "Search Patients",
  "patient.field.mrn": "Medical Record Number",
  "patient.field.fullName": "Full Name",
  "patient.field.dob": "Date of Birth",
  "patient.field.gender": "Gender",
  "patient.field.gender.male": "Male",
  "patient.field.gender.female": "Female",
  "patient.field.gender.other": "Other",
  "patient.action.merge": "Merge Patients",
  "patient.message.created": "Patient created successfully",
  "patient.message.mergeConfirm": "Are you sure you want to merge these patients? This action cannot be undone.",
  "patient.error.notFound": "Patient not found",
  "patient.error.duplicateMrn": "A patient with this MRN already exists"
}
```

**vi/patient.json:**
```json
{
  "patient.title": "Quản lý Bệnh nhân",
  "patient.create": "Tạo Bệnh nhân",
  "patient.search": "Tìm kiếm Bệnh nhân",
  "patient.field.mrn": "Mã hồ sơ bệnh án",
  "patient.field.fullName": "Họ và tên",
  "patient.field.dob": "Ngày sinh",
  "patient.field.gender": "Giới tính",
  "patient.field.gender.male": "Nam",
  "patient.field.gender.female": "Nữ",
  "patient.field.gender.other": "Khác",
  "patient.action.merge": "Hợp nhất Bệnh nhân",
  "patient.message.created": "Tạo bệnh nhân thành công",
  "patient.message.mergeConfirm": "Bạn có chắc chắn muốn hợp nhất các bệnh nhân này? Hành động này không thể hoàn tác.",
  "patient.error.notFound": "Không tìm thấy bệnh nhân",
  "patient.error.duplicateMrn": "Đã tồn tại bệnh nhân với mã hồ sơ này"
}
```

#### 15.9 Bilingual Notification Template Example

**Email: Task Assigned**

```
Subject [en]: New annotation task assigned: Case #{caseId}
Subject [vi]: Nhiệm vụ chú thích mới được giao: Ca #{caseId}

Body [en]:
Hello {userName},
You have been assigned a new annotation task for Case #{caseId}.
Patient: {patientName} | Study: {studyDescription} | Priority: {priority}
SLA Deadline: {slaDeadline}
Click here to start: {taskUrl}

Body [vi]:
Xin chào {userName},
Bạn đã được giao nhiệm vụ chú thích mới cho Ca #{caseId}.
Bệnh nhân: {patientName} | Nghiên cứu: {studyDescription} | Ưu tiên: {priority}
Hạn SLA: {slaDeadline}
Nhấn vào đây để bắt đầu: {taskUrl}
```

#### 15.10 i18n Key Naming Convention

Pattern: `{namespace}.{context}.{element}`

Examples:
- `case.list.title` → "Case List" / "Danh sách Ca bệnh"
- `case.detail.status.in_progress` → "In Progress" / "Đang thực hiện"
- `annotation.toolbar.brush` → "Brush Tool" / "Công cụ cọ vẽ"
- `workflow.sla.warning` → "SLA Warning" / "Cảnh báo SLA"
- `common.action.save` → "Save" / "Lưu"
- `common.action.cancel` → "Cancel" / "Hủy"
- `error.http.403` → "Access denied" / "Từ chối truy cập"

---

## 16. API Design and Service Contracts

### [VI] Thiết kế API và hợp đồng dịch vụ

### [EN] API Design and Service Contracts

#### 16.1 API Versioning Strategy

- URL-based: `/api/v1/patients`, `/api/v2/patients`
- Content negotiation as fallback: `Accept: application/vnd.medicalpower.v1+json`
- Breaking changes require version bump
- Deprecation: 6-month notice, sunset header

#### 16.2 Common Error Model

```json
{
  "error": {
    "code": "PATIENT_NOT_FOUND",
    "message": "Patient with ID abc-123 not found",
    "message_key": "patient.error.notFound",
    "details": [],
    "trace_id": "req-xyz-789"
  }
}
```

#### 16.3 Service API Contracts

---

##### identity-service

**Responsibility:** User, role, organization management (thin adapter over Keycloak)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/users` | List users (filtered by org) | org_admin+ |
| GET | `/api/v1/users/:id` | Get user profile | self or org_admin |
| PATCH | `/api/v1/users/:id` | Update user profile | self or org_admin |
| GET | `/api/v1/roles` | List roles | org_admin |
| POST | `/api/v1/roles` | Create role | org_admin |
| GET | `/api/v1/organizations` | List organizations | system_admin |
| GET | `/api/v1/organizations/:id` | Get organization | org_admin |
| GET | `/api/v1/departments` | List departments | org_admin |

---

##### patient-service

**Responsibility:** Patient registry CRUD, identifier management, merge

| Method | Endpoint | Description | Auth | Idempotency |
|--------|----------|-------------|------|-------------|
| POST | `/api/v1/patients` | Create patient | clinical_lead+ | Idempotency-Key header |
| GET | `/api/v1/patients` | Search patients | annotator+ | — |
| GET | `/api/v1/patients/:id` | Get patient | annotator+ | — |
| PATCH | `/api/v1/patients/:id` | Update patient | clinical_lead+ | — |
| POST | `/api/v1/patients/merge` | Merge duplicate patients | org_admin | Idempotency-Key header |
| GET | `/api/v1/patients/:id/visits` | List patient visits | annotator+ | — |

**Sample: Create Patient**
```json
// POST /api/v1/patients
// Request:
{
  "mrn": "VN-HCM-2026-001234",
  "national_id": "079123456789",
  "full_name": "Nguyễn Văn An",
  "dob": "1985-07-15",
  "gender": "male",
  "contact_info": {
    "phone": "+84 909 123 456",
    "address": "123 Nguyễn Huệ, Q.1, TP.HCM"
  }
}

// Response: 201
{
  "id": "pat_abc123",
  "mrn": "VN-HCM-2026-001234",
  "full_name": "Nguyễn Văn An",
  "dob": "1985-07-15",
  "gender": "male",
  "status": "active",
  "created_at": "2026-03-19T10:00:00Z"
}
```

---

##### case-service

**Responsibility:** Case lifecycle, study linkage, priority/SLA management

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/cases` | Create case | clinical_lead+ |
| GET | `/api/v1/cases` | List/search cases | annotator+ |
| GET | `/api/v1/cases/:id` | Get case detail | annotator+ |
| PATCH | `/api/v1/cases/:id` | Update case | clinical_lead+ |
| POST | `/api/v1/cases/:id/studies` | Link study to case | clinical_lead+ |
| DELETE | `/api/v1/cases/:id/studies/:study_id` | Unlink study | clinical_lead+ |
| GET | `/api/v1/cases/:id/tasks` | List case tasks | annotator+ |
| GET | `/api/v1/cases/:id/diagnoses` | List case diagnoses | radiologist+ |

**Sample: Create Case**
```json
// POST /api/v1/cases
{
  "patient_id": "pat_abc123",
  "title": "Chest CT - Lung nodule evaluation",
  "description": "Đánh giá nốt phổi phát hiện trên CT ngực",
  "priority": "high",
  "taxonomy_ids": ["tax_lung_nodule"],
  "workflow_template_id": "wft_standard_annotation"
}

// Response: 201
{
  "id": "case_xyz789",
  "patient_id": "pat_abc123",
  "title": "Chest CT - Lung nodule evaluation",
  "status": "draft",
  "priority": "high",
  "created_by": "user_lead01",
  "created_at": "2026-03-19T10:05:00Z"
}
```

---

##### study-service

**Responsibility:** DICOMweb proxy, study metadata cache

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/studies` | Search studies | annotator+ |
| GET | `/api/v1/studies/:id` | Get study metadata | annotator+ |
| GET | `/api/v1/studies/:id/series` | List series | annotator+ |
| GET | `/api/v1/dicomweb/studies` | QIDO-RS proxy | annotator+ |
| GET | `/api/v1/dicomweb/studies/:uid/series/:uid/instances` | WADO-RS proxy | annotator+ |

---

##### annotation-service

**Responsibility:** Annotation session lifecycle, artifact CRUD, versioning

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/sessions` | Create annotation session | annotator+ |
| GET | `/api/v1/sessions/:id` | Get session | annotator+ |
| PATCH | `/api/v1/sessions/:id` | Update session status | annotator+ |
| POST | `/api/v1/sessions/:id/artifacts` | Save artifact | annotator+ |
| GET | `/api/v1/sessions/:id/artifacts` | List session artifacts | annotator+ |
| GET | `/api/v1/artifacts/:id` | Get artifact detail + download URL | annotator+ |
| GET | `/api/v1/artifacts/:id/versions` | Get artifact version history | annotator+ |

**Sample: Save Annotation Artifact**
```json
// POST /api/v1/sessions/sess_001/artifacts
{
  "type": "segmentation",
  "label": "liver",
  "series_id": "ser_ct001",
  "format": "nifti",
  "provenance": {
    "creator_type": "human_edited_ai",
    "model_version": "v1.1.0",
    "inference_job_id": "job_inf001",
    "tool_used": "brush",
    "edit_description": "Refined liver boundary"
  }
}
// + multipart file upload for mask data

// Response: 201
{
  "id": "art_seg001",
  "session_id": "sess_001",
  "type": "segmentation",
  "label": "liver",
  "version": 2,
  "parent_version_id": "art_seg000",
  "storage_path": "artifacts/seg/art_seg001.nii.gz",
  "created_at": "2026-03-19T10:30:00Z"
}
```

---

##### segmentation-service

**Responsibility:** AI inference orchestration, MONAI Label integration, model registry

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/inference` | Request AI inference | annotator+ |
| GET | `/api/v1/inference/:id` | Get inference job status | annotator+ |
| GET | `/api/v1/models` | List available models | annotator+ |
| GET | `/api/v1/models/:id` | Get model details | annotator+ |
| GET | `/api/v1/models/:id/versions` | List model versions | data_scientist+ |
| POST | `/api/v1/models/:id/versions` | Register new model version | data_scientist |
| PATCH | `/api/v1/models/:id/versions/:v` | Update version status | data_scientist |
| GET | `/api/v1/training/candidates` | List training candidates | data_scientist |
| POST | `/api/v1/training/runs` | Trigger training run | data_scientist |

---

##### workflow-service

**Responsibility:** Task state machine, assignment, SLA, review decisions

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/tasks` | List/search tasks | annotator+ |
| GET | `/api/v1/tasks/:id` | Get task detail | annotator+ |
| PATCH | `/api/v1/tasks/:id` | Update task (start, lock, release) | assigned_user |
| POST | `/api/v1/tasks/:id/submit` | Submit task | assigned_user |
| POST | `/api/v1/tasks/:id/reviews` | Submit review decision | reviewer+ |
| GET | `/api/v1/tasks/:id/reviews` | List review decisions | reviewer+ |
| GET | `/api/v1/workflow-templates` | List workflow templates | clinical_lead+ |
| POST | `/api/v1/workflow-templates` | Create workflow template | org_admin |
| GET | `/api/v1/workflow-runs/:id` | Get workflow run status | clinical_lead+ |

---

##### diagnosis-service

**Responsibility:** Diagnosis CRUD, ICD code management, taxonomy

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/diagnoses` | Create diagnosis | radiologist+ |
| GET | `/api/v1/diagnoses/:id` | Get diagnosis | radiologist+ |
| PATCH | `/api/v1/diagnoses/:id` | Update diagnosis | radiologist+ |
| GET | `/api/v1/icd/search` | Search ICD codes | radiologist+ |
| GET | `/api/v1/taxonomy` | List taxonomy tree | annotator+ |
| POST | `/api/v1/taxonomy` | Create taxonomy node | org_admin |

---

##### report-service

**Responsibility:** Diagnostic report generation, FHIR export

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/reports` | Create report | radiologist+ |
| GET | `/api/v1/reports/:id` | Get report | radiologist+ |
| PATCH | `/api/v1/reports/:id` | Update report | radiologist+ |
| POST | `/api/v1/reports/:id/sign` | Sign/finalize report | radiologist |
| GET | `/api/v1/reports/:id/pdf` | Download PDF | radiologist+ |
| GET | `/api/v1/reports/:id/fhir` | Export as FHIR DiagnosticReport | integration+ |

---

##### notification-service

**Responsibility:** Multi-channel notification delivery

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/notifications` | List user notifications | self |
| PATCH | `/api/v1/notifications/:id/read` | Mark as read | self |
| POST | `/api/v1/notifications/mark-all-read` | Mark all read | self |
| WS | `/ws/notifications` | Real-time notification stream | self |

---

##### audit-service

**Responsibility:** Immutable audit trail, compliance query

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/audit-logs` | Query audit logs | org_admin+ |
| GET | `/api/v1/audit-logs/export` | Export audit logs (CSV) | org_admin+ |

Note: Audit events are ingested via RabbitMQ, not direct REST POST.

---

##### integration-service

**Responsibility:** External system gateway, FHIR server, webhook management

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/integrations` | List integration configs | integration_engineer |
| POST | `/api/v1/integrations` | Create integration config | integration_engineer |
| GET | `/api/v1/webhooks` | List webhook subscriptions | integration_engineer |
| POST | `/api/v1/webhooks` | Create webhook subscription | integration_engineer |
| GET | `/api/v1/fhir/Patient` | FHIR Patient endpoint | integration+ |
| GET | `/api/v1/fhir/ImagingStudy` | FHIR ImagingStudy endpoint | integration+ |
| POST | `/api/v1/fhir/DiagnosticReport` | FHIR DiagnosticReport create | integration+ |

---

## 17. Deployment Architecture

### [VI] Kiến trúc triển khai

### [EN] Deployment Architecture

#### 17.1 Local Developer Setup

**Components:**
- Portal (Next.js dev server): `localhost:3000`
- OHIF (dev server): `localhost:3001`
- API services (NestJS dev): `localhost:4000-4011`
- Segmentation service (FastAPI): `localhost:5000`
- MONAI Label: `localhost:8000`
- Orthanc: `localhost:8042` (web) / `localhost:4242` (DICOM)
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- RabbitMQ: `localhost:5672` / `localhost:15672` (management)
- MinIO: `localhost:9000` / `localhost:9001` (console)
- Keycloak: `localhost:8080`

**Setup:** `docker compose -f docker-compose.dev.yml up -d` for infrastructure, then `pnpm dev` for application services.

#### 17.2 Docker Compose MVP

See Appendix G for complete skeleton.

**Environment Variables Template (.env):**
```env
# Database
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=medicalpower
POSTGRES_USER=mp_admin
POSTGRES_PASSWORD=<secret>

# Redis
REDIS_URL=redis://redis:6379

# RabbitMQ
RABBITMQ_URL=amqp://mp_user:mp_pass@rabbitmq:5672

# Keycloak
KEYCLOAK_URL=http://keycloak:8080
KEYCLOAK_REALM=medicalpower
KEYCLOAK_CLIENT_ID=mp-portal
KEYCLOAK_CLIENT_SECRET=<secret>

# Orthanc
ORTHANC_URL=http://orthanc:8042
ORTHANC_DICOMWEB_URL=http://orthanc:8042/dicom-web

# MinIO
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=<key>
MINIO_SECRET_KEY=<secret>
MINIO_BUCKET=medicalpower-artifacts

# MONAI Label
MONAI_LABEL_URL=http://monai-label:8000

# App
APP_URL=http://localhost:3000
OHIF_URL=http://localhost:3001
API_URL=http://localhost:4000
```

#### 17.3 Kubernetes Production Setup

**Namespace layout:**
```
medicalpower-system/
  ├── portal-web (Deployment, Service, Ingress)
  ├── ohif-viewer (Deployment, Service, Ingress)
  ├── api-gateway (Deployment, Service, Ingress)
  ├── identity-service (Deployment, Service)
  ├── patient-service (Deployment, Service)
  ├── case-service (Deployment, Service)
  ├── study-service (Deployment, Service)
  ├── annotation-service (Deployment, Service)
  ├── segmentation-service (Deployment, Service) [GPU node]
  ├── workflow-service (Deployment, Service)
  ├── diagnosis-service (Deployment, Service)
  ├── report-service (Deployment, Service)
  ├── notification-service (Deployment, Service)
  ├── audit-service (Deployment, Service)
  └── integration-service (Deployment, Service)

medicalpower-infra/
  ├── postgresql (StatefulSet, PVC)
  ├── redis (StatefulSet, PVC)
  ├── rabbitmq (StatefulSet, PVC)
  ├── minio (StatefulSet, PVC)
  ├── orthanc (StatefulSet, PVC)
  ├── keycloak (Deployment, PVC)
  └── monai-label (Deployment, GPU toleration/affinity)

medicalpower-observability/
  ├── prometheus (StatefulSet)
  ├── grafana (Deployment)
  ├── loki (StatefulSet)
  └── tempo (StatefulSet)
```

**Scaling:**
- API services: HPA based on CPU/memory (2-10 replicas)
- segmentation-service: GPU node pool, 1 replica per GPU
- MONAI Label: GPU affinity, 1-2 replicas
- Portal/OHIF: CDN + 2-5 replicas
- PostgreSQL: Primary + read replica
- RabbitMQ: 3-node cluster (quorum queues)

**Persistent Volumes:**
- PostgreSQL: 100Gi SSD
- Orthanc: 500Gi-2Ti (DICOM storage)
- MinIO: 200Gi-1Ti (artifact storage)
- RabbitMQ: 20Gi SSD

**Backup:**
- PostgreSQL: pg_dump daily to object storage, WAL archiving for PITR
- MinIO: bucket versioning + cross-region replication
- Orthanc: DICOM backup to secondary archive

---

## 18. DevOps, Observability, and Operations

### [VI] DevOps, Quan sát hệ thống, và Vận hành

### [EN] DevOps, Observability, and Operations

#### 18.1 CI/CD Pipeline

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  Commit   │→│  Build    │→│  Test     │→│  Deploy   │→│  Verify   │
│  (lint)   │  │  (docker) │  │  (unit+   │  │  (staging)│  │  (smoke   │
│           │  │           │  │  integ)   │  │           │  │  tests)   │
└──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
                                                │
                                          ┌─────▼─────┐
                                          │  Promote   │
                                          │  to Prod   │
                                          └───────────┘
```

**Stages:**
1. **Lint + Format:** ESLint, Prettier, Python ruff/black, i18n key validation
2. **Build:** Docker multi-stage builds, Next.js build, NestJS compile, FastAPI package
3. **Test:** Unit tests (>80% coverage), integration tests, DICOM test fixtures
4. **Security scan:** Trivy (containers), Snyk (dependencies)
5. **Deploy to staging:** Kubernetes rolling update, database migrations
6. **Smoke tests:** Health checks, critical path E2E
7. **Promote to production:** Manual approval gate, canary deployment (10% → 50% → 100%)

#### 18.2 Observability Stack

| Component | Tool | Purpose |
|-----------|------|---------|
| Metrics | Prometheus | Service metrics, API latency, error rates |
| Dashboards | Grafana | Visualization, alerting dashboards |
| Logs | Loki | Centralized log aggregation |
| Traces | Tempo (OpenTelemetry) | Distributed tracing across services |
| Alerts | Grafana Alerting | PagerDuty/Slack integration |
| Uptime | Prometheus blackbox exporter | Endpoint health monitoring |

**Key Metrics:**
- API response time (p50, p95, p99) per service
- Error rate (5xx, 4xx) per service
- Task queue depth and processing rate
- Inference latency and GPU utilization
- Active annotation sessions
- SLA compliance rate
- DICOM study ingest rate

#### 18.3 Operational Runbooks

- **Service restart procedure**
- **Database failover**
- **MONAI Label GPU recovery**
- **Orthanc storage full**
- **RabbitMQ queue backup**
- **Keycloak token issues**
- **Certificate renewal**
- **Backup restore drill**

---

## 19. Repo / Monorepo Structure

### [VI] Cấu trúc monorepo

### [EN] Repo / Monorepo Structure

```
medicalpower/
├── apps/
│   ├── portal-web/              # Next.js portal application
│   │   ├── src/
│   │   │   ├── app/             # App Router pages
│   │   │   ├── components/      # React components
│   │   │   ├── hooks/           # Custom hooks
│   │   │   ├── lib/             # Utilities
│   │   │   └── styles/          # Tailwind + global styles
│   │   ├── public/
│   │   ├── next.config.ts
│   │   └── package.json
│   │
│   ├── ohif-shell/              # OHIF Viewer with custom modes/extensions
│   │   ├── extensions/
│   │   │   ├── monai-segmentation/
│   │   │   ├── annotation-save/
│   │   │   └── task-context/
│   │   ├── modes/
│   │   │   └── annotation-mode/
│   │   ├── platform/
│   │   └── package.json
│   │
│   └── admin-web/               # Admin console (can be route group in portal)
│       └── ...
│
├── services/
│   ├── identity-service/        # NestJS — auth adapter
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   ├── guards/
│   │   │   └── main.ts
│   │   ├── prisma/
│   │   ├── test/
│   │   └── package.json
│   │
│   ├── patient-service/         # NestJS — patient registry
│   ├── case-service/            # NestJS — case management
│   ├── study-service/           # NestJS — DICOMweb proxy
│   ├── annotation-service/      # NestJS — annotation/artifact mgmt
│   ├── workflow-service/        # NestJS — task/workflow engine
│   ├── diagnosis-service/       # NestJS — diagnosis/ICD/taxonomy
│   ├── report-service/          # NestJS — diagnostic reports
│   ├── notification-service/    # NestJS — notifications
│   ├── audit-service/           # NestJS — audit trail
│   ├── integration-service/     # NestJS — FHIR/PACS gateway
│   │
│   └── segmentation-service/    # FastAPI (Python) — AI/MONAI orchestration
│       ├── app/
│       │   ├── api/
│       │   ├── models/
│       │   ├── services/
│       │   └── main.py
│       ├── tests/
│       ├── requirements.txt
│       └── Dockerfile
│
├── packages/
│   ├── ui/                      # Shared React component library (shadcn/ui based)
│   │   ├── src/components/
│   │   └── package.json
│   │
│   ├── types/                   # Shared TypeScript types/interfaces
│   │   ├── src/
│   │   │   ├── patient.ts
│   │   │   ├── case.ts
│   │   │   ├── annotation.ts
│   │   │   ├── workflow.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── config/                  # Shared configuration schemas
│   │   └── package.json
│   │
│   ├── i18n/                    # Translation files and utilities
│   │   ├── locales/
│   │   │   ├── vi/
│   │   │   └── en/
│   │   ├── src/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── eslint-config/           # Shared ESLint configuration
│   │   └── package.json
│   │
│   └── tsconfig/                # Shared TypeScript configuration
│       ├── base.json
│       ├── nextjs.json
│       ├── nestjs.json
│       └── package.json
│
├── infra/
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   ├── docker-compose.dev.yml
│   │   ├── docker-compose.test.yml
│   │   └── Dockerfile.*
│   │
│   ├── k8s/
│   │   ├── base/                # Kustomize base
│   │   ├── overlays/
│   │   │   ├── staging/
│   │   │   └── production/
│   │   └── helm/                # Helm charts (alternative)
│   │
│   └── terraform/
│       ├── modules/
│       └── environments/
│
├── docs/
│   ├── vi/                      # Vietnamese documentation
│   ├── en/                      # English documentation
│   ├── adr/                     # Architecture Decision Records
│   │   ├── 001-dicom-backend-orthanc.md
│   │   ├── 002-workflow-engine-custom.md
│   │   └── ...
│   ├── api/                     # OpenAPI specs
│   ├── architecture/            # Architecture diagrams
│   └── workflows/               # Workflow documentation
│
├── scripts/
│   ├── setup.sh                 # Initial dev setup
│   ├── seed-data.sh             # Database seeding
│   └── dicom-import.sh          # DICOM test data import
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── cd-staging.yml
│       └── cd-production.yml
│
├── turbo.json                   # Turborepo configuration
├── pnpm-workspace.yaml          # pnpm workspace
├── package.json                 # Root package.json
└── README.md
```

**Folder Ownership:**

| Folder | Owner | Key Files |
|--------|-------|-----------|
| `apps/portal-web` | Frontend team | `app/`, `components/`, `next.config.ts` |
| `apps/ohif-shell` | Imaging team | `extensions/`, `modes/`, OHIF config |
| `services/*-service` | Backend team (per service) | `src/modules/`, `prisma/schema.prisma` |
| `services/segmentation-service` | AI/ML team | `app/api/`, `app/services/`, model configs |
| `packages/ui` | Frontend team | Shared components |
| `packages/types` | Backend + Frontend | Domain type definitions |
| `packages/i18n` | Product team + translators | `locales/vi/`, `locales/en/` |
| `infra/` | DevOps/Platform team | Docker, K8s, Terraform configs |
| `docs/` | All teams | Documentation by domain |

---

## 20. Documentation Set

### [VI] Bộ tài liệu

### [EN] Documentation Set

| # | Document | Filename | Audience | Owner | Update Freq |
|---|----------|----------|----------|-------|-------------|
| 1 | Product Requirements | `docs/en/PRD.md`, `docs/vi/PRD.md` | Product, Eng, Clinical | Product Manager | Per release |
| 2 | Solution Architecture | `docs/en/solution-architecture.md` | Eng, DevOps, Architects | Solution Architect | Quarterly |
| 3 | System Context Diagram | `docs/architecture/system-context.md` | All stakeholders | Solution Architect | Quarterly |
| 4 | Container Diagram | `docs/architecture/container-diagram.md` | Eng, DevOps | Solution Architect | Quarterly |
| 5 | Deployment Guide | `docs/en/deployment-guide.md` | DevOps, SRE | Platform Engineer | Per release |
| 6 | Local Setup Guide | `docs/en/local-setup.md` | Developers | Tech Lead | Per sprint |
| 7 | API Specification | `docs/api/openapi-*.yaml` | Frontend, Backend, Integration | Backend Lead | Per sprint |
| 8 | Data Model Spec | `docs/en/data-model.md` | Backend, DBA | Backend Lead | Per release |
| 9 | Workflow Spec | `docs/en/workflow-spec.md` | Product, Eng, Clinical | Product + Eng Lead | Per release |
| 10 | AI Integration Spec | `docs/en/ai-integration.md` | AI/ML, Backend | AI/ML Lead | Per release |
| 11 | Security Architecture | `docs/en/security-architecture.md` | Security, Compliance, Eng | Security Lead | Quarterly |
| 12 | Operations Runbook | `docs/en/runbook.md` | SRE, DevOps | SRE Lead | Continuous |
| 13 | QA Test Strategy | `docs/en/test-strategy.md` | QA, Eng | QA Lead | Per release |
| 14 | Release Plan | `docs/en/release-plan.md` | Product, Eng, QA | Release Manager | Per release |
| 15 | ADR List | `docs/adr/` | Eng, Architects | All engineers | Continuous |
| 16 | i18n Guide | `docs/en/i18n-guide.md` | Frontend, Translators | Frontend Lead | Per release |
| 17 | Contributor Guide | `docs/en/CONTRIBUTING.md` | All developers | Tech Lead | Quarterly |

**Document Outline Examples:**

**PRD Outline:**
1. Vision & Mission
2. Target Users & Personas
3. Problem Statement
4. Solution Overview
5. Feature Requirements (by module)
6. Non-Functional Requirements
7. Success Metrics
8. Assumptions & Constraints
9. Release Phases

**Solution Architecture Outline:**
1. Executive Summary
2. System Context
3. Container Architecture
4. Component Architecture (per service)
5. Data Architecture
6. Integration Architecture
7. Security Architecture
8. Deployment Architecture
9. Technology Decisions
10. Quality Attributes

---

## 21. Implementation Roadmap

### [VI] Lộ trình triển khai

### [EN] Implementation Roadmap

#### Phase 0: Discovery & Architecture (Weeks 1-4)

**Goals:** Validate requirements, finalize architecture, setup infrastructure  
**Scope:**
- Stakeholder interviews (radiologists, annotators, clinical leads in Vietnamese hospitals)
- Architecture design review and ADR documentation
- Technology proof-of-concept (OHIF + Orthanc + MONAI Label integration)
- Dev environment setup (monorepo, CI/CD, Docker Compose)
- Keycloak realm and RBAC setup

**Deliverables:**
- Signed-off PRD (vi/en)
- Solution Architecture Document
- ADR-001 through ADR-010
- Working dev environment with OHIF + Orthanc
- Keycloak configured with test users

**Team:** Solution Architect, Product Manager, Tech Lead, 1 Frontend, 1 Backend  
**Risks:** Stakeholder availability, OHIF version compatibility  
**Acceptance:** OHIF loads study from Orthanc via DICOMweb in dev environment

---

#### Phase 1: MVP — Imaging + Case/Task Management (Weeks 5-14)

**Goals:** Core case management with OHIF viewer integration  
**Scope:**
- Patient CRUD (patient-service)
- Case CRUD + study linkage (case-service)
- Study metadata service + DICOMweb proxy (study-service)
- OHIF viewer launch from case context
- Basic task management (create, assign, status transitions)
- Identity service (Keycloak adapter, RBAC)
- Portal web: patient list, case list, case detail, viewer launch
- i18n framework setup + initial vi/en translations
- Audit logging (basic)

**Deliverables:**
- Working portal with patient/case management
- OHIF viewer opens from case page
- Task assignment and status tracking
- Bilingual UI (vi/en)
- API documentation
- 80%+ unit test coverage

**Dependencies:** Phase 0 infrastructure  
**Team:** 2 Frontend, 3 Backend, 1 DevOps, 1 QA  
**Risks:** OHIF deep-linking complexity, Orthanc DICOMweb compatibility  
**Acceptance:** Clinical Lead can create case, link study, assign annotator. Annotator opens OHIF from task queue.

---

#### Phase 2: AI-Assisted Annotation (Weeks 15-22)

**Goals:** MONAI Label integration for AI-assisted segmentation  
**Scope:**
- segmentation-service (FastAPI)
- MONAI Label deployment with initial models (SegResNet for organ segmentation)
- Inference request flow (portal → segmentation-service → MONAI Label)
- OHIF custom extension: MONAI segmentation panel
- Annotation session management
- Artifact storage (MinIO) and versioning
- Interactive segmentation (click-based via DeepEdit)
- Provenance tracking
- Measurement tools

**Deliverables:**
- AI auto-segmentation from OHIF
- Interactive segmentation refinement
- Annotation artifact storage with versioning
- Model selection UI
- Updated portal with annotation management views

**Dependencies:** Phase 1 MVP, GPU node availability  
**Team:** 2 Frontend, 2 Backend, 1 ML Engineer, 1 DevOps, 1 QA  
**Risks:** GPU availability, MONAI Label version compatibility, inference latency  
**Acceptance:** Annotator can request AI segmentation, edit result, save versioned artifact with provenance.

---

#### Phase 3: QA/Review + Collaboration (Weeks 23-30)

**Goals:** Multi-tier review workflow, collaborative annotation  
**Scope:**
- QA review workflow (single review, double-read, adjudication)
- Review decision management
- Collaborative annotation (task partitioning, locking, merge)
- Diagnosis and report module
- Enhanced workflow engine (SLA timers, escalation, auto-assignment)
- Notification service (email + in-app + WebSocket)
- Dashboard: task distribution, SLA compliance, productivity

**Deliverables:**
- Complete review workflow
- Collaborative annotation for complex cases
- Diagnosis creation and reporting
- Real-time notifications
- Operational dashboards

**Dependencies:** Phase 2  
**Team:** 2 Frontend, 3 Backend, 1 DevOps, 1 QA  
**Risks:** Merge conflict resolution complexity, notification reliability  
**Acceptance:** Complete annotation → review → approval → diagnosis → report cycle works end-to-end.

---

#### Phase 4: Enterprise Integration + Scale (Weeks 31-40)

**Goals:** Hospital system integration, production hardening  
**Scope:**
- FHIR R4 gateway (Patient, ImagingStudy, DiagnosticReport)
- PACS integration (DICOM C-STORE receive, study routing)
- Webhook outbound system
- n8n for administrative automation
- Kubernetes production deployment
- Horizontal scaling, load testing
- Security hardening (penetration testing, compliance audit)
- Multi-tenant production configuration

**Deliverables:**
- FHIR-compliant API endpoints
- PACS receive and auto-routing
- Webhook integration framework
- Production K8s deployment
- Load test results (200 concurrent users)
- Security audit report

**Dependencies:** Phase 3, hospital partner for integration testing  
**Team:** 2 Frontend, 3 Backend, 1 Integration Engineer, 2 DevOps, 1 Security, 1 QA  
**Risks:** Hospital IT cooperation, FHIR compliance edge cases  
**Acceptance:** System receives study from hospital PACS, creates case, processes through workflow, exports FHIR report.

---

#### Phase 5: Model Feedback Loop + Continuous Improvement (Weeks 41-52)

**Goals:** Active learning, model improvement, operational maturity  
**Scope:**
- Training data curation pipeline
- De-identification pipeline
- Model retraining trigger and validation
- Model A/B testing (shadow mode)
- Model registry with lifecycle management
- Advanced analytics and reporting
- Performance optimization
- Documentation completion

**Deliverables:**
- Active learning pipeline
- Model versioning with A/B comparison
- De-identification for training data
- Comprehensive analytics dashboards
- Complete documentation set (vi/en)

**Dependencies:** Phase 4, sufficient annotation volume for retraining  
**Team:** 1 Frontend, 2 Backend, 2 ML Engineers, 1 DevOps, 1 QA  
**Risks:** Insufficient training data volume, model performance regression  
**Acceptance:** New model trained on approved annotations shows improved Dice score. Model promoted through registry with validation.

---

#### 12-Month Roadmap Table

| Month | Phase | Key Milestones |
|-------|-------|---------------|
| 1 | Phase 0 | Architecture finalized, dev env ready |
| 2-3 | Phase 1 | Patient + Case CRUD, OHIF integration |
| 3-4 | Phase 1 | Task management, portal MVP, i18n setup |
| 4-5 | Phase 2 | MONAI Label integration, auto-segmentation |
| 5-6 | Phase 2 | Interactive segmentation, artifact versioning |
| 6-7 | Phase 3 | QA review workflow, double-read |
| 7-8 | Phase 3 | Collaborative annotation, diagnosis/reporting |
| 8-9 | Phase 4 | FHIR gateway, PACS integration |
| 9-10 | Phase 4 | Production K8s, security hardening |
| 10-11 | Phase 5 | Active learning pipeline |
| 11-12 | Phase 5 | Model feedback loop, analytics |

#### Backlog Epics

| Epic | Priority | Phase |
|------|----------|-------|
| E-01: Patient Registry | P0 | 1 |
| E-02: Case Management | P0 | 1 |
| E-03: OHIF Viewer Integration | P0 | 1 |
| E-04: Task Management | P0 | 1 |
| E-05: Identity & RBAC | P0 | 1 |
| E-06: i18n Framework | P0 | 1 |
| E-07: MONAI Label Integration | P0 | 2 |
| E-08: Annotation Session Management | P0 | 2 |
| E-09: AI Inference Orchestration | P0 | 2 |
| E-10: OHIF Custom Extensions | P1 | 2 |
| E-11: QA Review Workflow | P0 | 3 |
| E-12: Collaborative Annotation | P1 | 3 |
| E-13: Diagnosis & Reporting | P1 | 3 |
| E-14: Notification System | P1 | 3 |
| E-15: FHIR Integration | P1 | 4 |
| E-16: PACS Integration | P1 | 4 |
| E-17: Production Deployment | P0 | 4 |
| E-18: Active Learning Pipeline | P2 | 5 |
| E-19: Model Registry & Lifecycle | P2 | 5 |
| E-20: Analytics & Dashboards | P2 | 5 |

#### Suggested Squad Structure

| Squad | Members | Focus |
|-------|---------|-------|
| **Portal Squad** | 2 FE, 1 BE | Portal web, admin console, i18n |
| **Imaging Squad** | 1 FE, 1 BE, 1 ML | OHIF extensions, viewer integration, MONAI |
| **Workflow Squad** | 2 BE | Case, task, workflow, review, notification |
| **Platform Squad** | 1 BE, 2 DevOps | Identity, audit, integration, infrastructure |
| **AI Squad** | 1 BE (Python), 1 ML | segmentation-service, model training, active learning |

---

## 22. Risks and Tradeoffs

### [VI] Rủi ro và đánh đổi

### [EN] Risks and Tradeoffs

| # | Risk | Probability | Impact | Mitigation |
|---|------|-------------|--------|------------|
| R-01 | OHIF v3 API changes break custom extensions | Medium | High | Pin OHIF version, abstract extension API, E2E tests |
| R-02 | MONAI Label version incompatibility with custom models | Medium | High | Version lock, integration tests, fallback to manual annotation |
| R-03 | GPU unavailability delays AI features | Medium | High | Cloud GPU burst (AWS/GCP), graceful degradation without AI |
| R-04 | Hospital IT refuses DICOMweb, only supports legacy DICOM | High | Medium | Orthanc DICOM C-STORE support, integration-service protocol adapter |
| R-05 | Vietnamese medical terminology translation errors | Medium | Medium | Clinical advisor review, glossary management, community validation |
| R-06 | Microservice complexity slows MVP delivery | Medium | Medium | Start with modular monolith (NestJS modules), extract later |
| R-07 | DICOM data volume exceeds Orthanc capacity | Low | High | Orthanc PostgreSQL index plugin, archival tier, dcm4chee migration path |
| R-08 | Keycloak operations complexity | Low | Medium | Container deployment, Helm chart, documented runbooks |
| R-09 | Regulatory requirements unclear for Vietnam medical AI | High | High | Legal consultation, configurable compliance controls, data residency |
| R-10 | Team unfamiliar with DICOM/DICOMweb | Medium | Medium | Training sessions, DICOM primer documentation, OHIF community support |

**Key Tradeoffs:**

1. **Custom workflow vs Temporal:** Custom gives faster MVP iteration and full control; sacrifices durability guarantees that Temporal provides. Migration path documented in ADR-002.

2. **NestJS + FastAPI (two languages) vs all-Python or all-TypeScript:** Optimizes each service for its domain (CRUD in TypeScript, ML in Python) at the cost of operational complexity. Two separate CI pipelines, two dependency ecosystems.

3. **Orthanc vs dcm4chee:** Orthanc is simpler to operate but lacks some enterprise features. Documented migration path to dcm4chee if needed.

4. **Modular monolith (Phase 1) vs microservices from day one:** Starting with NestJS modules in a single process reduces deployment complexity for MVP while maintaining module boundaries for future extraction.

---

## 23. Open Questions / Assumptions

### [VI] Câu hỏi mở / Giả định

### [EN] Open Questions / Assumptions

#### Assumptions

| # | Assumption | Impact if Wrong |
|---|-----------|-----------------|
| A-01 | Target hospitals have DICOMweb-capable PACS or will accept Orthanc as DICOM receiver | Need legacy DICOM C-STORE/C-FIND support |
| A-02 | GPU hardware available for MONAI Label (NVIDIA GPU with ≥8GB VRAM) | Cannot run AI inference, manual-only mode |
| A-03 | Single PostgreSQL database sufficient for MVP (logical multi-tenant) | Need per-tenant database or sharding |
| A-04 | Vietnamese healthcare regulations don't require specific certification for AI diagnostic tools at annotation stage | May need regulatory pathway (FDA-equivalent) |
| A-05 | Team has or can acquire DICOM/medical imaging domain expertise | Need external consulting or training |
| A-06 | OHIF v3 is stable enough for production medical imaging use | Need alternative viewer or heavy customization |
| A-07 | 200 concurrent annotators is sufficient for initial production deployment | Need earlier scaling investment |
| A-08 | RabbitMQ throughput sufficient for event volume (< 10K events/hour) | Need Kafka earlier |

#### Open Questions for Stakeholders

| # | Question | Decision Needed By |
|---|---------|-------------------|
| Q-01 | Which DICOM modalities are primary targets? (CT, MRI, X-ray, US, all?) | Phase 0 |
| Q-02 | What annotation types are highest priority? (organ segmentation, lesion detection, measurements?) | Phase 0 |
| Q-03 | Are there specific Vietnamese healthcare regulations for AI-assisted annotation tools? | Phase 0 |
| Q-04 | Do target hospitals require on-premise deployment or is private cloud acceptable? | Phase 0 |
| Q-05 | What is the expected annotation volume? (cases/day, studies/week) | Phase 1 |
| Q-06 | Should the platform support multi-organization (SaaS) or single-organization deployment? | Phase 1 |
| Q-07 | What ICD version is standard in Vietnam? (ICD-10 vs ICD-11) | Phase 1 |
| Q-08 | Is HL7v2 integration required for specific hospital systems? | Phase 4 |
| Q-09 | What is the data retention policy for annotations and audit logs? | Phase 1 |
| Q-10 | Are there specific AI models / body parts to support first? | Phase 2 |

---

## 24. Appendices

### Appendix A: Mermaid System Context Diagram

```mermaid
graph TB
    subgraph External
        Radiologist[Radiologist / Bác sĩ]
        Annotator[Annotator / Kỹ thuật viên]
        ClinicalLead[Clinical Lead / Trưởng nhóm]
        DataScientist[Data Scientist]
        Admin[System Admin]
        HospitalPACS[Hospital PACS]
        HospitalEMR[Hospital EMR/HIS]
    end

    subgraph MedicalPower[MedicalPower Platform]
        Portal[Portal Web App]
        OHIFViewer[OHIF Viewer]
        APIGateway[API Gateway]
        BackendServices[Backend Services]
        AIServices[AI / MONAI Services]
        DICOMBackend[DICOM Backend - Orthanc]
        Database[(PostgreSQL)]
        ObjectStore[(MinIO)]
        MessageBus[RabbitMQ]
        AuthProvider[Keycloak]
    end

    Radiologist --> Portal
    Annotator --> Portal
    ClinicalLead --> Portal
    DataScientist --> Portal
    Admin --> Portal

    Portal --> APIGateway
    Portal --> OHIFViewer
    OHIFViewer --> DICOMBackend
    OHIFViewer --> AIServices

    APIGateway --> BackendServices
    APIGateway --> AuthProvider
    BackendServices --> Database
    BackendServices --> ObjectStore
    BackendServices --> MessageBus
    BackendServices --> DICOMBackend

    AIServices --> DICOMBackend
    AIServices --> ObjectStore

    HospitalPACS -->|DICOM/DICOMweb| DICOMBackend
    HospitalEMR -->|FHIR R4| BackendServices
```

### Appendix B: Mermaid Container Diagram

```mermaid
graph TB
    subgraph Client[Client Layer]
        PortalWeb[Portal Web<br/>Next.js 15]
        OHIFApp[OHIF Viewer<br/>React SPA]
        AdminWeb[Admin Console<br/>Next.js]
    end

    subgraph Gateway[Gateway Layer]
        Traefik[Traefik<br/>API Gateway]
    end

    subgraph Services[Service Layer - NestJS]
        IdentitySvc[identity-service]
        PatientSvc[patient-service]
        CaseSvc[case-service]
        StudySvc[study-service]
        AnnotationSvc[annotation-service]
        WorkflowSvc[workflow-service]
        DiagnosisSvc[diagnosis-service]
        ReportSvc[report-service]
        NotifSvc[notification-service]
        AuditSvc[audit-service]
        IntegrationSvc[integration-service]
    end

    subgraph AI[AI Layer - Python]
        SegSvc[segmentation-service<br/>FastAPI]
        MONAILabel[MONAI Label<br/>Server]
    end

    subgraph Infra[Infrastructure]
        PG[(PostgreSQL 16)]
        Redis[(Redis 7)]
        RMQ[RabbitMQ]
        MinIO[(MinIO)]
        Orthanc[Orthanc<br/>DICOM Server]
        KC[Keycloak 25]
    end

    PortalWeb --> Traefik
    OHIFApp --> Traefik
    AdminWeb --> Traefik

    Traefik --> IdentitySvc
    Traefik --> PatientSvc
    Traefik --> CaseSvc
    Traefik --> StudySvc
    Traefik --> AnnotationSvc
    Traefik --> WorkflowSvc
    Traefik --> DiagnosisSvc
    Traefik --> ReportSvc
    Traefik --> NotifSvc
    Traefik --> AuditSvc
    Traefik --> IntegrationSvc
    Traefik --> SegSvc

    OHIFApp -->|DICOMweb| Orthanc
    StudySvc -->|DICOMweb| Orthanc
    SegSvc --> MONAILabel
    MONAILabel -->|Read DICOM| Orthanc

    PatientSvc --> PG
    CaseSvc --> PG
    StudySvc --> PG
    AnnotationSvc --> PG
    WorkflowSvc --> PG
    DiagnosisSvc --> PG
    ReportSvc --> PG
    AuditSvc --> PG
    IntegrationSvc --> PG

    AnnotationSvc --> MinIO
    SegSvc --> MinIO
    ReportSvc --> MinIO

    WorkflowSvc --> RMQ
    NotifSvc --> RMQ
    AuditSvc --> RMQ

    IdentitySvc --> Redis
    WorkflowSvc --> Redis
```

### Appendix C: Mermaid ERD

(See Section 10.2 above for the complete ERD)

### Appendix D: Sample REST Payloads

**Create Case Request:**
```json
POST /api/v1/cases
Authorization: Bearer <token>
Content-Type: application/json
Idempotency-Key: idem_case_20260319_001

{
  "patient_id": "pat_abc123",
  "title": "Chest CT - Lung nodule evaluation",
  "description": "Đánh giá nốt phổi phát hiện trên CT ngực",
  "priority": "high",
  "taxonomy_ids": ["tax_lung_nodule", "tax_chest_ct"],
  "workflow_template_id": "wft_standard_annotation",
  "metadata": {
    "referring_physician": "Dr. Trần Văn Bình",
    "clinical_context": "Follow-up 6 months after initial CT"
  }
}
```

**Create Case Response:**
```json
HTTP/1.1 201 Created
Location: /api/v1/cases/case_xyz789

{
  "id": "case_xyz789",
  "patient_id": "pat_abc123",
  "title": "Chest CT - Lung nodule evaluation",
  "status": "draft",
  "priority": "high",
  "taxonomy": [
    {"id": "tax_lung_nodule", "name_en": "Lung Nodule", "name_vi": "Nốt phổi"},
    {"id": "tax_chest_ct", "name_en": "Chest CT", "name_vi": "CT ngực"}
  ],
  "workflow_run": null,
  "studies": [],
  "created_by": {
    "id": "user_lead01",
    "name": "Nguyễn Thị Lan"
  },
  "created_at": "2026-03-19T10:05:00Z",
  "updated_at": "2026-03-19T10:05:00Z"
}
```

**Request AI Inference:**
```json
POST /api/v1/inference
Authorization: Bearer <token>

{
  "model_id": "model_liver_seg",
  "model_version": "latest",
  "study_uid": "1.2.840.113654.2.70.1.123456789",
  "series_uid": "1.2.840.113654.2.70.1.123456789.1",
  "params": {
    "interaction_type": "auto",
    "output_format": "nifti"
  }
}
```

**Inference Response (Accepted):**
```json
HTTP/1.1 202 Accepted

{
  "job_id": "job_inf001",
  "status": "queued",
  "model": {
    "id": "model_liver_seg",
    "version": "v1.1.0",
    "name": "Liver Segmentation (SegResNet)"
  },
  "estimated_time_seconds": 8,
  "poll_url": "/api/v1/inference/job_inf001"
}
```

**Inference Completed (Poll Response):**
```json
{
  "job_id": "job_inf001",
  "status": "completed",
  "execution_time_ms": 6234,
  "result": {
    "artifact_id": "art_seg_auto001",
    "format": "nifti",
    "download_url": "/api/v1/artifacts/art_seg_auto001/download",
    "labels": ["liver"],
    "dice_confidence": 0.92
  }
}
```

**Submit Review Decision:**
```json
POST /api/v1/tasks/task_review01/reviews
Authorization: Bearer <token>

{
  "decision": "rejected",
  "reason": "Liver boundary inaccurate in inferior segments",
  "discrepancy_type": "boundary_inaccurate",
  "comments": "Phân đoạn ranh giới gan không chính xác ở các đoạn dưới. Cần chỉnh sửa lại vùng segment 6 và 7.",
  "affected_slices": [45, 46, 47, 48, 49, 50],
  "severity": "major"
}
```

### Appendix E: Sample i18n Translation Files

**en/common.json:**
```json
{
  "common.app.name": "MedicalPower",
  "common.app.tagline": "AI-Powered Medical Imaging Platform",
  "common.action.save": "Save",
  "common.action.cancel": "Cancel",
  "common.action.delete": "Delete",
  "common.action.edit": "Edit",
  "common.action.create": "Create",
  "common.action.search": "Search",
  "common.action.filter": "Filter",
  "common.action.export": "Export",
  "common.action.submit": "Submit",
  "common.action.approve": "Approve",
  "common.action.reject": "Reject",
  "common.action.back": "Back",
  "common.action.next": "Next",
  "common.action.confirm": "Confirm",
  "common.status.active": "Active",
  "common.status.inactive": "Inactive",
  "common.status.pending": "Pending",
  "common.status.completed": "Completed",
  "common.table.noData": "No data available",
  "common.table.loading": "Loading...",
  "common.error.generic": "An error occurred. Please try again.",
  "common.error.network": "Network error. Please check your connection.",
  "common.error.unauthorized": "You are not authorized to perform this action.",
  "common.pagination.showing": "Showing {from}-{to} of {total}",
  "common.pagination.perPage": "Per page"
}
```

**vi/common.json:**
```json
{
  "common.app.name": "MedicalPower",
  "common.app.tagline": "Nền tảng Hình ảnh Y khoa Hỗ trợ AI",
  "common.action.save": "Lưu",
  "common.action.cancel": "Hủy",
  "common.action.delete": "Xóa",
  "common.action.edit": "Chỉnh sửa",
  "common.action.create": "Tạo mới",
  "common.action.search": "Tìm kiếm",
  "common.action.filter": "Lọc",
  "common.action.export": "Xuất",
  "common.action.submit": "Gửi",
  "common.action.approve": "Phê duyệt",
  "common.action.reject": "Từ chối",
  "common.action.back": "Quay lại",
  "common.action.next": "Tiếp theo",
  "common.action.confirm": "Xác nhận",
  "common.status.active": "Hoạt động",
  "common.status.inactive": "Không hoạt động",
  "common.status.pending": "Đang chờ",
  "common.status.completed": "Hoàn thành",
  "common.table.noData": "Không có dữ liệu",
  "common.table.loading": "Đang tải...",
  "common.error.generic": "Đã xảy ra lỗi. Vui lòng thử lại.",
  "common.error.network": "Lỗi mạng. Vui lòng kiểm tra kết nối.",
  "common.error.unauthorized": "Bạn không có quyền thực hiện hành động này.",
  "common.pagination.showing": "Hiển thị {from}-{to} trong tổng số {total}",
  "common.pagination.perPage": "Mỗi trang"
}
```

**en/case.json:**
```json
{
  "case.title": "Case Management",
  "case.list.title": "Case List",
  "case.list.empty": "No cases found",
  "case.create.title": "Create New Case",
  "case.detail.title": "Case Detail",
  "case.detail.patient": "Patient",
  "case.detail.studies": "Linked Studies",
  "case.detail.tasks": "Tasks",
  "case.detail.diagnoses": "Diagnoses",
  "case.field.title": "Case Title",
  "case.field.description": "Description",
  "case.field.priority": "Priority",
  "case.field.priority.critical": "Critical",
  "case.field.priority.high": "High",
  "case.field.priority.normal": "Normal",
  "case.field.priority.low": "Low",
  "case.field.status": "Status",
  "case.status.draft": "Draft",
  "case.status.open": "Open",
  "case.status.in_progress": "In Progress",
  "case.status.review": "In Review",
  "case.status.completed": "Completed",
  "case.status.closed": "Closed",
  "case.action.linkStudy": "Link Study",
  "case.action.assignAnnotator": "Assign Annotator",
  "case.action.openViewer": "Open Viewer",
  "case.message.created": "Case created successfully",
  "case.message.assigned": "Case assigned to {assignee}"
}
```

**vi/case.json:**
```json
{
  "case.title": "Quản lý Ca bệnh",
  "case.list.title": "Danh sách Ca bệnh",
  "case.list.empty": "Không tìm thấy ca bệnh nào",
  "case.create.title": "Tạo Ca bệnh mới",
  "case.detail.title": "Chi tiết Ca bệnh",
  "case.detail.patient": "Bệnh nhân",
  "case.detail.studies": "Nghiên cứu liên kết",
  "case.detail.tasks": "Nhiệm vụ",
  "case.detail.diagnoses": "Chẩn đoán",
  "case.field.title": "Tiêu đề Ca",
  "case.field.description": "Mô tả",
  "case.field.priority": "Ưu tiên",
  "case.field.priority.critical": "Nghiêm trọng",
  "case.field.priority.high": "Cao",
  "case.field.priority.normal": "Bình thường",
  "case.field.priority.low": "Thấp",
  "case.field.status": "Trạng thái",
  "case.status.draft": "Nháp",
  "case.status.open": "Mở",
  "case.status.in_progress": "Đang thực hiện",
  "case.status.review": "Đang duyệt",
  "case.status.completed": "Hoàn thành",
  "case.status.closed": "Đã đóng",
  "case.action.linkStudy": "Liên kết Nghiên cứu",
  "case.action.assignAnnotator": "Giao cho Người chú thích",
  "case.action.openViewer": "Mở Trình xem",
  "case.message.created": "Tạo ca bệnh thành công",
  "case.message.assigned": "Ca bệnh đã được giao cho {assignee}"
}
```

### Appendix F: Sample Workflow State Machine JSON

**Standard Annotation Workflow Template:**
```json
{
  "id": "wft_standard_annotation",
  "name": "Standard Annotation Workflow",
  "name_vi": "Quy trình Chú thích Tiêu chuẩn",
  "version": "1.0.0",
  "state_machine": {
    "initial_state": "intake",
    "states": {
      "intake": {
        "type": "task",
        "task_type": "intake",
        "transitions": [
          {"event": "submit", "target": "annotation", "conditions": ["has_study_linked"]}
        ]
      },
      "annotation": {
        "type": "task",
        "task_type": "annotate",
        "assignment_rule": "round_robin",
        "assignment_pool": "annotators",
        "sla_hours": 24,
        "transitions": [
          {"event": "submit", "target": "first_review"}
        ]
      },
      "first_review": {
        "type": "task",
        "task_type": "review",
        "assignment_rule": "least_loaded",
        "assignment_pool": "reviewers",
        "assignment_constraints": ["not_same_as_annotator"],
        "sla_hours": 12,
        "transitions": [
          {"event": "approve", "target": "check_double_read"},
          {"event": "reject", "target": "annotation"}
        ]
      },
      "check_double_read": {
        "type": "decision",
        "condition": "workflow_config.require_double_read",
        "transitions": [
          {"condition_true": "second_review"},
          {"condition_false": "diagnosis"}
        ]
      },
      "second_review": {
        "type": "task",
        "task_type": "review",
        "assignment_rule": "least_loaded",
        "assignment_pool": "reviewers",
        "assignment_constraints": ["not_same_as_annotator", "not_same_as_first_reviewer"],
        "sla_hours": 12,
        "transitions": [
          {"event": "approve", "target": "check_agreement"},
          {"event": "reject", "target": "annotation"}
        ]
      },
      "check_agreement": {
        "type": "decision",
        "condition": "reviews_agree",
        "transitions": [
          {"condition_true": "diagnosis"},
          {"condition_false": "adjudication"}
        ]
      },
      "adjudication": {
        "type": "task",
        "task_type": "adjudicate",
        "assignment_rule": "manual",
        "assignment_pool": "senior_radiologists",
        "sla_hours": 24,
        "transitions": [
          {"event": "approve", "target": "diagnosis"},
          {"event": "reject", "target": "annotation"}
        ]
      },
      "diagnosis": {
        "type": "task",
        "task_type": "diagnose",
        "assignment_rule": "same_as_reviewer",
        "sla_hours": 8,
        "transitions": [
          {"event": "submit", "target": "reporting"}
        ]
      },
      "reporting": {
        "type": "task",
        "task_type": "report",
        "assignment_rule": "same_as_diagnoser",
        "sla_hours": 8,
        "transitions": [
          {"event": "finalize", "target": "completed"}
        ]
      },
      "completed": {
        "type": "terminal"
      }
    }
  },
  "sla_config": {
    "default_sla_hours": 24,
    "warning_threshold_percent": 75,
    "critical_threshold_percent": 90,
    "escalation_target": "clinical_lead"
  },
  "config": {
    "require_double_read": true,
    "allow_self_review": false,
    "auto_assign": true
  }
}
```

### Appendix G: Sample Docker Compose Skeleton

```yaml
# docker-compose.yml - MedicalPower MVP
version: "3.9"

services:
  # === Infrastructure ===
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: medicalpower
      POSTGRES_USER: mp_admin
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U mp_admin"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  rabbitmq:
    image: rabbitmq:3.13-management-alpine
    environment:
      RABBITMQ_DEFAULT_USER: mp_user
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD}
    ports:
      - "5672:5672"
      - "15672:15672"
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data

  keycloak:
    image: quay.io/keycloak/keycloak:25.0
    command: start-dev --import-realm
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: ${KEYCLOAK_ADMIN_PASSWORD}
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
      KC_DB_USERNAME: mp_admin
      KC_DB_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "8080:8080"
    volumes:
      - ./infra/keycloak/realm-export.json:/opt/keycloak/data/import/realm.json
    depends_on:
      postgres:
        condition: service_healthy

  # === DICOM Backend ===
  orthanc:
    image: orthancteam/orthanc:24.12.1
    environment:
      ORTHANC__DICOM_WEB__ENABLE: "true"
      ORTHANC__REGISTERED_USERS: |
        {"mp_user": "${ORTHANC_PASSWORD}"}
      ORTHANC__POSTGRESQL__HOST: postgres
      ORTHANC__POSTGRESQL__DATABASE: orthanc
      ORTHANC__POSTGRESQL__USERNAME: mp_admin
      ORTHANC__POSTGRESQL__PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "8042:8042"
      - "4242:4242"
    volumes:
      - orthanc_data:/var/lib/orthanc/db
    depends_on:
      postgres:
        condition: service_healthy

  # === AI Services ===
  monai-label:
    image: projectmonai/monailabel:latest
    command: monailabel start_server --app /app/apps/radiology --studies http://orthanc:8042/dicom-web --port 8000
    environment:
      NVIDIA_VISIBLE_DEVICES: all
    ports:
      - "8000:8000"
    volumes:
      - monai_data:/app/data
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    depends_on:
      - orthanc

  # === Application Services ===
  api-gateway:
    image: traefik:v3.2
    command:
      - "--api.insecure=true"
      - "--providers.file.filename=/etc/traefik/dynamic.yml"
      - "--entrypoints.web.address=:80"
    ports:
      - "4000:80"
      - "8081:8080"
    volumes:
      - ./infra/traefik/dynamic.yml:/etc/traefik/dynamic.yml

  portal-web:
    build:
      context: .
      dockerfile: apps/portal-web/Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:4000
      NEXT_PUBLIC_OHIF_URL: http://localhost:3001
      KEYCLOAK_URL: http://keycloak:8080
      KEYCLOAK_REALM: medicalpower
      KEYCLOAK_CLIENT_ID: mp-portal
      KEYCLOAK_CLIENT_SECRET: ${KEYCLOAK_CLIENT_SECRET}
    ports:
      - "3000:3000"
    depends_on:
      - keycloak

  ohif-viewer:
    build:
      context: .
      dockerfile: apps/ohif-shell/Dockerfile
    environment:
      REACT_APP_CONFIG: /app/config/default.js
    ports:
      - "3001:80"
    depends_on:
      - orthanc

  # Backend services would follow the same pattern:
  # patient-service, case-service, study-service, etc.
  # Each with their own Dockerfile and environment variables

volumes:
  pg_data:
  redis_data:
  rabbitmq_data:
  minio_data:
  orthanc_data:
  monai_data:
```

### Appendix H: Sample Kubernetes Deployment Skeleton

```yaml
# k8s/base/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: medicalpower-system
  labels:
    app.kubernetes.io/part-of: medicalpower

---
# k8s/base/patient-service/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: patient-service
  namespace: medicalpower-system
  labels:
    app: patient-service
    app.kubernetes.io/part-of: medicalpower
spec:
  replicas: 2
  selector:
    matchLabels:
      app: patient-service
  template:
    metadata:
      labels:
        app: patient-service
    spec:
      serviceAccountName: patient-service
      containers:
        - name: patient-service
          image: medicalpower/patient-service:latest
          ports:
            - containerPort: 4001
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: medicalpower-secrets
                  key: database-url
            - name: RABBITMQ_URL
              valueFrom:
                secretKeyRef:
                  name: medicalpower-secrets
                  key: rabbitmq-url
            - name: REDIS_URL
              valueFrom:
                secretKeyRef:
                  name: medicalpower-secrets
                  key: redis-url
            - name: KEYCLOAK_URL
              valueFrom:
                configMapKeyRef:
                  name: medicalpower-config
                  key: keycloak-url
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: 500m
              memory: 512Mi
          livenessProbe:
            httpGet:
              path: /health
              port: 4001
            initialDelaySeconds: 15
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 4001
            initialDelaySeconds: 5
            periodSeconds: 5

---
# k8s/base/patient-service/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: patient-service
  namespace: medicalpower-system
spec:
  selector:
    app: patient-service
  ports:
    - port: 80
      targetPort: 4001
  type: ClusterIP

---
# k8s/base/patient-service/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: patient-service
  namespace: medicalpower-system
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: patient-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70

---
# k8s/base/segmentation-service/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: segmentation-service
  namespace: medicalpower-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: segmentation-service
  template:
    metadata:
      labels:
        app: segmentation-service
    spec:
      nodeSelector:
        nvidia.com/gpu.present: "true"
      tolerations:
        - key: nvidia.com/gpu
          operator: Exists
          effect: NoSchedule
      containers:
        - name: segmentation-service
          image: medicalpower/segmentation-service:latest
          ports:
            - containerPort: 5000
          env:
            - name: MONAI_LABEL_URL
              value: http://monai-label:8000
            - name: MINIO_ENDPOINT
              valueFrom:
                configMapKeyRef:
                  name: medicalpower-config
                  key: minio-endpoint
          resources:
            requests:
              cpu: 500m
              memory: 2Gi
            limits:
              cpu: 2000m
              memory: 4Gi

---
# k8s/base/monai-label/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: monai-label
  namespace: medicalpower-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: monai-label
  template:
    metadata:
      labels:
        app: monai-label
    spec:
      nodeSelector:
        nvidia.com/gpu.present: "true"
      tolerations:
        - key: nvidia.com/gpu
          operator: Exists
          effect: NoSchedule
      containers:
        - name: monai-label
          image: projectmonai/monailabel:latest
          command: ["monailabel", "start_server"]
          args:
            - "--app"
            - "/app/apps/radiology"
            - "--studies"
            - "http://orthanc:8042/dicom-web"
            - "--port"
            - "8000"
          ports:
            - containerPort: 8000
          resources:
            requests:
              nvidia.com/gpu: 1
              cpu: 1000m
              memory: 8Gi
            limits:
              nvidia.com/gpu: 1
              cpu: 4000m
              memory: 16Gi
          volumeMounts:
            - name: model-storage
              mountPath: /app/data
      volumes:
        - name: model-storage
          persistentVolumeClaim:
            claimName: monai-label-models-pvc
```

### Appendix I: Prioritized ADR List

| ADR # | Title | Status | Priority |
|-------|-------|--------|----------|
| ADR-001 | DICOM Backend Selection: Orthanc | Accepted | P0 |
| ADR-002 | Workflow Engine: Custom State Machine → Temporal Migration Path | Accepted | P0 |
| ADR-003 | Backend Framework: NestJS + FastAPI (Python for AI) | Accepted | P0 |
| ADR-004 | Frontend Framework: Next.js App Router | Accepted | P0 |
| ADR-005 | Authentication Provider: Keycloak | Accepted | P0 |
| ADR-006 | Database: PostgreSQL with JSONB | Accepted | P0 |
| ADR-007 | Message Queue: RabbitMQ (MVP) → Kafka (Enterprise) | Accepted | P0 |
| ADR-008 | Object Storage: MinIO (Self-hosted S3) | Accepted | P1 |
| ADR-009 | AI Serving: MONAI Label (MVP) → MONAI Deploy (Enterprise) | Accepted | P0 |
| ADR-010 | Monorepo Strategy: Turborepo + pnpm Workspaces | Accepted | P1 |
| ADR-011 | i18n Strategy: next-intl + Namespace-based JSON | Accepted | P1 |
| ADR-012 | Tenant Isolation: Logical (Shared DB, Row-Level Security) | Proposed | P1 |
| ADR-013 | Annotation Artifact Format: NIfTI Primary, DICOM SEG for Interop | Proposed | P1 |
| ADR-014 | OHIF Custom Mode vs Standard Configuration | Proposed | P1 |
| ADR-015 | API Gateway: Traefik vs Kong | Proposed | P2 |
| ADR-016 | Observability Stack: Prometheus + Grafana + Loki + Tempo | Proposed | P2 |
| ADR-017 | CI/CD Pipeline: GitHub Actions vs GitLab CI | Proposed | P2 |
| ADR-018 | n8n for Administrative Automation (Non-clinical Only) | Proposed | P2 |
| ADR-019 | De-identification Strategy for AI Training Data | Proposed | P2 |
| ADR-020 | Modular Monolith (Phase 1) to Microservices (Phase 4) Strategy | Proposed | P1 |

### Appendix J: Open Questions for Stakeholders

| # | Question | Category | Urgency | Decision Needed By |
|---|---------|----------|---------|-------------------|
| Q-01 | Which DICOM modalities are primary targets? (CT only? CT+MRI? All?) | Product | High | Phase 0 Week 2 |
| Q-02 | What annotation types are highest priority? (organ segmentation, lesion detection, measurements, all?) | Product | High | Phase 0 Week 2 |
| Q-03 | Are there specific Vietnamese MoH regulations for AI-assisted annotation/diagnostic tools? | Compliance | Critical | Phase 0 Week 3 |
| Q-04 | Do target hospitals require on-premise deployment or is private cloud (VN-hosted) acceptable? | Infrastructure | High | Phase 0 Week 3 |
| Q-05 | What is the expected annotation volume? (cases/day per hospital) | Capacity | Medium | Phase 1 |
| Q-06 | Single-tenant (per-hospital) or multi-tenant (SaaS) deployment model? | Architecture | High | Phase 0 Week 4 |
| Q-07 | Which ICD version is standard in Vietnamese hospitals? ICD-10-CM or ICD-10 WHO or ICD-11? | Data | Medium | Phase 1 |
| Q-08 | Is HL7v2 ADT/ORM integration required for any target hospital? | Integration | Medium | Phase 4 |
| Q-09 | What is the data retention policy for medical annotations and audit logs? (5 years? 7 years? 10 years?) | Compliance | Medium | Phase 1 |
| Q-10 | Which initial AI models/body parts to deploy? (e.g., liver segmentation, lung nodule, brain tumor) | AI/ML | High | Phase 2 |
| Q-11 | Budget for GPU infrastructure? (cloud vs on-premise NVIDIA GPUs) | Infrastructure | High | Phase 2 |
| Q-12 | Will the platform be used for clinical decision support or only for annotation/research? (impacts regulatory requirements) | Compliance | Critical | Phase 0 Week 2 |
| Q-13 | Are there existing hospital IT systems to integrate with? Which ones? (HIS, RIS, LIS names/vendors) | Integration | Medium | Phase 4 |
| Q-14 | What is the target number of hospitals for the first year? | Business | Medium | Phase 0 Week 4 |
| Q-15 | Should anonymized case data be shareable across organizations for research purposes? | Data Governance | Medium | Phase 5 |

---

**END OF PLANNING DOCUMENT**

*This document should be reviewed by: Solution Architect, Product Manager, Clinical Advisor, AI/ML Lead, Security Lead, and DevOps Lead before moving to Phase 0 execution.*

*Document ID: MP-PLAN-001*  
*Classification: Internal / Confidential*
