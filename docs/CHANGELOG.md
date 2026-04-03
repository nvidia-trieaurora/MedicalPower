# MedicalPower Changelog

All notable architectural and feature changes are documented here.

## [Unreleased]

### 2026-04-01 — Task Workflow Redesign + Real-time Collaboration
- **Task Creation Wizard** (`/tasks/new`) — 3-step wizard:
  - Step 1: Search patient (fuzzy) + select case
  - Step 2: Configure task type, priority, assignee (filtered by permission), workflow template, SLA
  - Step 3: Review + confirm + create via API
- **Action Buttons Connected** — All task actions now call `taskApi.transition()`:
  - Start, Submit, Send for Review, Approve, Reject, Complete
  - Toast notifications on success/failure, auto-refresh task list
- **WebSocket Real-time Gateway** — `RealtimeGateway` using socket.io:
  - Events: `task:updated`, `task:assigned`, `chat:message`, `chat:typing`, `notification:new`
  - User authentication via `auth` event, room-based task channels
  - Frontend `SocketProvider` with auto-reconnect
- **P2P Chat** — Real-time chat within task context:
  - `TaskComment` Prisma model (`12_chat.prisma`)
  - Chat API: `GET/POST /api/v1/tasks/:taskId/comments`
  - `TaskChat` component: bubble UI, typing indicator, system messages, auto-scroll
  - WebSocket emit on new message
- **Task Detail Page** (`/tasks/[id]`) — Full task view with:
  - Patient/case info, status, assignee, SLA
  - Action buttons (Start, Submit, Approve, Reject, Complete)
  - Integrated chat panel (right side)
  - OHIF Viewer deep-link
- **Task Creation Button** — Added "Tạo nhiệm vụ" button to tasks page header
- **POST /api/v1/tasks** — New endpoint for creating tasks from portal
- **Workflow Template API client** — `workflowTemplateApi.list()` for template dropdown
- Planning document: `docs/PLANNING-task-workflow.md`

### 2026-03-27 — RBAC Permission System + Notification System
- Permission + Notification modules restored (14 files)
- Admin Permission Dashboard with fuzzy search + toggle switches
- Toast system, Bell icon with dropdown, Notification list page
- usePermissions hook, PermissionGuard, sidebar permission filtering

### 2026-03-23 — Full Portal-Backend Integration (Cases, Tasks, Dashboard, Study Sync)
- **Case Management API** — Added `CaseModule` to workflow-service (port 4006):
  - `GET/POST/PATCH/DELETE /api/v1/cases` with pagination, search, filter by status/priority/patient
  - Case detail includes patient, study links, tasks, creator relations
  - Create case with optional study IDs (creates CaseStudyLink entries)
  - Soft delete with `deletedAt` timestamp
- **Dashboard Stats API** — `GET /api/v1/dashboard/stats` returns real DB counts:
  - totalPatients, totalCases, activeTasks, completedToday, pendingReview, slaAtRisk
- **Task API Enhancement** — Task list now includes `case.title`, `case.patient`, `case.studyLinks`
  for display on portal without extra API calls
- **Portal API Client** — Extended `api.ts` with:
  - `workflowApi` (base URL: workflow-service at port 4006)
  - `caseApi.list/get/create/update/delete`
  - `taskApi.list/get/transition`
  - `dashboardApi.stats`
  - TypeScript interfaces: `Case`, `Task`, `DashboardStats`
- **Portal Pages → Real API** — All pages now call API first, fallback to mock data:
  - `/` (Dashboard): `dashboardApi.stats()` + `caseApi.list` + `taskApi.list`
  - `/cases`: `caseApi.list` with search/status filters
  - `/tasks`: `taskApi.list` with case relations
  - `/patients/[id]`: `patientApi.get(id)` with cases + studies
- **Orthanc Study Sync API** — `GET/POST /api/studies/sync`:
  - Reads all studies from Orthanc via REST API
  - Extracts metadata: StudyInstanceUID, modality, patient, series counts

### 2026-03-23 — Real Clinical Data Integration (3 Patients, 5 Studies)
- Replaced mock/synthetic patient data with 3 real clinical patients from BV Thống Nhất:
  - **Bùi Trọng Tình** (MRN: 23057406) — 2 CT C-Spine studies (598 + 520 instances)
  - **Bùi Viết Lâm** (MRN: 15122510) — 1 CT Hàm-Mặt study (341 instances)
  - **Bùi Thế Thiêm** (MRN: 13093945) — 2 CT C-Spine studies (457 + 487 instances)
- Updated `packages/database/prisma/seed.ts`: 3 patients, 5 studies with real StudyInstanceUIDs
- Updated `apps/portal-web/src/lib/mock-data.ts`: matching patients, studies, cases, tasks
- All StudyInstanceUIDs now match actual DICOM data in Orthanc
- Cases now link multiple studies (primary + comparison/follow-up) for realistic workflow
- Created `scripts/upload-all-patients.sh` for batch DICOM upload of all 3 patients
- Total: 2,403 DICOM instances across 5 studies

### 2026-03-23 — OHIF Viewer Theme Unification with Portal Web
- Unified OHIF Viewer color palette to match Portal Web dark mode (neutral grays instead of navy/indigo)
- Updated 3 CSS theme files (`ui-next/tailwind.css`, `ui/tailwind.css`, `App.css`) with consistent tokens:
  - Background: `#171717` (neutral dark) replacing `#050615` (deep navy)
  - Primary accent: violet `#7c3aed` / `#8b5cf6` replacing blue `#348cfd`
  - Cards/panels: `#212121` replacing `#090C29`
  - Borders: `rgba(255,255,255,0.1)` matching Portal Web
  - Muted text: `#a3a3a3` (neutral) replacing `#7BB2CE` (blue-tinted)
- Updated legacy Tailwind color map (`ui/tailwind.config.js`):
  - `bkg`, `primary`, `secondary`, `actions`, `customblue`, `common` — all neutral palette
- Redesigned OHIF logo: violet gradient badge with white heartbeat icon + Inter font
- Updated HTML template: title → "MedicalPower Viewer", theme-color → `#171717`
- Body inline style ensures no blue flash before CSS loads

### 2026-03-22 — System-wide i18n Refactor (EN/VI bilingual)
- Created `LocaleProvider` context (`apps/portal-web/src/lib/locale-context.tsx`) as single source of truth for locale state
- All components now share locale via React Context instead of independent `useState` per component
- `useLocale()` hook refactored to consume context; backward-compatible re-export from `@/hooks/use-locale`
- `document.documentElement.lang` attribute now updates dynamically when locale changes
- Replaced ALL hardcoded Vietnamese strings across every page:
  - Dashboard (`/`), Patients (`/patients`, `/patients/[id]`), Cases (`/cases`, `/cases/[id]`)
  - Tasks (`/tasks`), Admin (`/admin`), Sidebar, Header, AppShell
- Added 50+ new i18n keys across `common`, `patient`, `case`, `workflow`, `admin` namespaces
- Cleaned up locale files: each namespace key lives only in its own JSON file (no cross-namespace pollution in `common.json`)
- Date formatting is now locale-aware (`vi-VN` / `en-US` based on current locale)
- Updated `CLAUDE.md` with comprehensive i18n architecture docs, checklist, and step-by-step guide for adding new keys

### 2026-03-23 — Real-time Container Log Viewer
- Service cards on `/admin/system` are now clickable — opens a slide-out log panel
- Created API route `/api/admin/logs?service=xxx&tail=200` that reads real container logs:
  - Docker services (postgres, redis, orthanc, keycloak, rabbitmq, minio, monai-label): uses `docker logs` with timestamps
  - Backend services (patient-service, workflow-service): reads stdout/stderr via process discovery on port
- Built `ServiceLogPanel` component (Sheet slide-out) with:
  - Real-time auto-refresh (5s interval) with pause/resume
  - Log level filtering (ERROR, WARN, INFO, DEBUG)
  - Configurable tail (50/200/500/1000 lines)
  - Auto-scroll with smart detection
  - Download logs as `.txt` file
  - Error/warning count badges
  - Terminal-style dark theme with color-coded log levels
- Logs tab on system page now shows service grid for quick access
- Added 10 new i18n keys (vi/en) for log panel UI
- Replaced all hardcoded Vietnamese strings in system page with `t()` calls

### 2026-03-21 — Admin Dashboard, Auth, System Monitoring
- Fixed portal crash (`StartNode is not defined`) — added `'use client'` to barrel export
- Built JWT auth system: login API (`/api/auth/login`, `/api/auth/me`), AuthProvider context
- Created login page at `/login` with dark theme, dev quick-login buttons
- 4 mock users: system_admin, clinical_lead, annotator, radiologist
- AppShell hides sidebar/header on login page
- Sidebar shows user info (name, role) and logout button
- Admin section in sidebar (only for system_admin/org_admin roles):
  - `/admin` — Dashboard with stats, recent activity, service overview
  - `/admin/users` — User management: search, filter, block/unblock, delete
  - `/admin/system` — System monitoring with auto-refresh health checks
- Admin layout with role guard (redirects non-admin users)
- Health check API (`/api/admin/health`) polls 10 services simultaneously
- System monitoring page: Services tab (health cards) + Logs tab (terminal-style viewer)
- Installed: `bcryptjs`, `jsonwebtoken`, `recharts`
- Fixed MONAI Label model dropdown (rewritten ModelSelector with inline styles)
- Fixed MONAI Label toolbar (OHIF v3.12 API: `ohif.toolButton`, `ohif.toolButtonList`)
- Fixed OHIF branding: MedicalPower logo, removed investigational use dialog

### 2026-03-21 — Workflow Builder (ReactFlow + Workflow Engine)
- Installed `@xyflow/react` (ReactFlow v12) for visual workflow builder
- Added "Quy trình" / "Workflows" to portal sidebar navigation (vi/en i18n)
- Created 5 custom ReactFlow nodes: StartNode, TaskNode, ConditionNode, ParallelNode, EndNode
- Built Workflow Builder page (`/workflows/builder`):
  - Drag-and-drop sidebar with all node types
  - ReactFlow canvas with snap-to-grid, minimap, controls
  - Config panel (right side) for editing node properties per type
  - Save workflow to JSON (stateMachineDef format)
- Created 3 preset workflow templates:
  - Simple Annotation (4 nodes: Start → AI Segment → Review → End)
  - Double-Read QA (6 nodes with condition branching by AI confidence)
  - Full Diagnostic Pipeline (7 nodes: AI → Annotate → Review → Diagnose → Report)
- Built Workflow Templates list page (`/workflows`) with duplicate/delete actions
- Implemented `workflow-service` (NestJS, port 4006):
  - WorkflowTemplate CRUD (controller, service, Prisma)
  - WorkflowRun lifecycle (create, update state, complete)
  - Task state machine: created → assigned → in_progress → submitted → in_review → approved/rejected → completed
  - Task API with pagination and filters
  - Workflow Engine: advance states, evaluate conditions, handle parallel tasks
  - Swagger docs at /docs
- Added WorkflowTracker component (read-only ReactFlow) to case detail page
- Created workflow API client (`lib/workflow-api.ts`) for frontend-backend integration
- Shared workflow types in `lib/workflow-types.ts`

### 2026-03-21 — OHIF + MONAI Label Integration
- Symlinked MONAI Label OHIF v3 extension and mode into OHIF Viewers workspace
- Created MedicalPower `pluginConfig.json` registering `@ohif/extension-monai-label`
  and `@ohif/mode-monai-label` alongside standard OHIF extensions
- Updated `start-ohif-dev.sh` to automatically:
  - Create MONAI Label extension/mode symlinks in OHIF
  - Copy MedicalPower pluginConfig.json and config into OHIF platform
  - Check MONAI Label server connectivity (localhost:8000)
  - Display MONAI Label mode URL in startup output
- Added `medicalpower` config section in `local_orthanc.js` with API URL
  and MONAI Label URL settings
- Refactored `@medicalpower/mode-annotation` to a full OHIF mode with:
  - `modeFactory` pattern matching OHIF v3 conventions
  - MONAI Label panel (right), Series list (left), segmentation viewports
  - Task context parsing from URL query params (`taskId`, `caseId`, etc.)
  - Proper tool groups with brush, scissors, probe, and ProbeMONAILabel tools
  - MPR hanging protocol and toolbar (WindowLevel, Pan, Zoom, MPR, Crosshairs, etc.)
- Enhanced `@medicalpower/extension-annotation-save` with notification feedback
  and task context integration for artifact persistence
- Enhanced `@medicalpower/extension-task-context` with commands for
  get/set/clear task context
- Centralized viewer URL generation in `lib/viewer.ts` with `getViewerUrl()`,
  `getMonaiLabelUrl()`, `getAnnotationUrl()` helpers
- Portal case detail page: added "AI Annotation" button (Brain icon) for CT/MR
  studies that opens MONAI Label mode directly
- Portal tasks page: annotation tasks now open in MONAI Label mode with
  task context params
- Portal patient detail page: added AI Annotation button for CT/MR studies
- CORS: MONAI Label server (FastAPI) has built-in CORS middleware — no proxy
  needed in dev mode; direct browser requests to localhost:8000

### 2026-03-21 — CI/CD Pipeline, Lint Gates, Portal-API Connection, OHIF Config
- GitHub Actions CI pipeline (`ci.yml`): 4 stages — lint, test (backend/python/frontend), build, security scan
- GitHub Actions CD pipelines: `cd-staging.yml` (develop branch), `cd-production.yml` (releases)
- i18n key consistency check in CI (vi/en must have same keys)
- Secret scanning in CI (prevents hardcoded passwords)
- Prettier config (`.prettierrc`) for consistent code formatting
- Ruff config (`pyproject.toml`) for Python linting
- Portal API client (`src/lib/api.ts`): centralized fetch with error handling
- Patient list page: real API calls with fallback to mock data if API unavailable
- OHIF Viewer config (`local_orthanc.js`): connects to Orthanc DICOMweb on localhost:8042
- OHIF dev startup script (`scripts/start-ohif-dev.sh`)
- Prisma schema refactored to multi-file domain-scoped structure (11 files)
- Cursor rules enhanced: scalability-first, SOLID principles, database and Python rules added

### 2026-03-21 — Database Schema & Patient Service (Step 1)
- Created shared `packages/database/` with Prisma schema (25+ tables)
- Tables: organizations, facilities, departments, users, roles, patients, visits,
  studies, cases, tasks, workflow_templates, workflow_runs, annotation_sessions,
  annotation_artifacts, segmentation_artifacts, measurement_artifacts,
  ai_models, model_versions, inference_jobs, taxonomies, diagnoses,
  diagnostic_reports, review_decisions, audit_logs, notifications
- Ran initial migration `init_schema` against PostgreSQL
- Created seed script with: 1 org (BV Thống Nhất), 5 patients, 3 studies,
  3 cases, 4 tasks, 8 roles, 4 users, 4 taxonomy entries, 2 AI models
- Built `patient-service` (NestJS): full CRUD API at `/api/v1/patients`
  with Prisma, search, pagination, soft delete, Swagger docs
- Verified: API returns real data from PostgreSQL

### 2026-03-20 — Project Governance & Testing
- Added `CLAUDE.md` with project rules, architecture decisions, coding conventions
- Added `.cursor/rules/` with 3 rule files (general, NestJS, portal-web)
- Created test directory structure for all 12 services + portal
- Added test fixtures (`tests/fixtures/`) with sample patient/case JSON
- Added unit tests for segmentation-service (MONAI client, schemas)
- Added `docs/CHANGELOG.md` (this file)
- Added `docs/en/infrastructure.md` — DB connection guide

### 2026-03-20 — Orthanc Admin UI & Sample DICOM Data
- Configured Orthanc Explorer 2 with dark theme and custom branding CSS
- Enabled auth: admin/mp_admin_2026, ohif/ohif_readonly
- Uploaded real DICOM data: BUI TRONG TINH, CT C-Spine Abscess (598 instances)
- Created `scripts/upload-dicom.sh` for batch DICOM upload
- Updated portal mock data with real patient/study info

### 2026-03-19 — Portal Web MVP
- Built Next.js 16 portal with App Router, TailwindCSS v4, shadcn/ui
- Pages: Dashboard, Patient list/create/detail, Case list/create/detail, Task queue
- Collapsible sidebar with Vietnamese/English locale switcher
- OHIF viewer deep-link integration
- i18n loading from `packages/i18n/locales/`

### 2026-03-19 — Monorepo Scaffold
- Initialized monorepo with Turborepo + pnpm workspaces
- Git submodules: OHIF Viewers v3.12.0, MONAI Label v0.8.5
- OHIF shell with custom config, MONAI extensions, Dockerfile
- Segmentation service (FastAPI) with MONAI client, MinIO artifact store
- 11 NestJS service placeholders
- 6 shared packages (ui, types, config, i18n, eslint-config, tsconfig)
- Docker Compose: PostgreSQL, Redis, RabbitMQ, MinIO, Orthanc, Keycloak, MONAI Label
- Keycloak realm with 9 roles, 4 test users, 3 OIDC clients
- i18n translations (vi/en) for 6 namespaces

### 2026-03-19 — Planning
- Created comprehensive `docs/PLANNING.md` (3600+ lines)
- 24 sections covering architecture, domain model, workflows, API, security, i18n
- 10 appendices: diagrams, ERD, sample payloads, Docker/K8s skeletons
