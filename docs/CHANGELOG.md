# MedicalPower Changelog

All notable architectural and feature changes are documented here.

## [Unreleased]

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
