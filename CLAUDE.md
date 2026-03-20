# CLAUDE.md — MedicalPower Project Intelligence

This file captures project conventions, architecture decisions, and rules that any AI assistant (Claude, Copilot, Cursor) must follow when working on MedicalPower.

## Project Overview

MedicalPower is a production-grade medical imaging annotation and case management platform built on OHIF Viewer, MONAI Label, and a dedicated workflow management engine.

**Repository:** https://github.com/nvidia-trieaurora/MedicalPower

## Critical Rules

### 0. Scalability & Maintainability — THE TOP PRIORITY

Every line of code must be written with scale and long-term maintenance in mind:

**Scalability:**
- Design for 10x current load from day one
- ALL list endpoints MUST have pagination (never return unbounded arrays)
- Database queries MUST use indexes — no unindexed WHERE/ORDER BY
- Services MUST be stateless — no in-memory state that can't survive restart
- Use async message queues for cross-service communication
- Consider: "will this work with 5 replicas behind a load balancer?"

**Maintainability:**
- Functions > 50 lines → break into smaller functions
- Max 3 levels of nesting → use early returns
- One module = one responsibility (SRP)
- Composition over inheritance
- Keep cyclomatic complexity low (< 5 branches per function)
- New developer should understand code in < 30 minutes

**Architecture Patterns:**
- SOLID principles (see `.cursor/rules/medicalpower.mdc`)
- Domain-Driven Design boundaries (see PLANNING.md Section 10)
- Layered architecture: Controller → Service → Repository
- Event-driven for cross-service: RabbitMQ domain events

**Cursor Rules:** See `.cursor/rules/` for file-specific rules:
- `medicalpower.mdc` — global rules (scalability, SOLID, security)
- `nestjs-service.mdc` — NestJS layered architecture, pagination, DI
- `portal-web.mdc` — React component patterns, performance, a11y
- `database-schema.mdc` — Prisma multi-file schema, indexes, PHI
- `python-service.mdc` — FastAPI async patterns, Pydantic models

### 1. Documentation-First Development

Every feature that introduces architectural changes, new services, new database schemas, or infrastructure modifications MUST:
- Update `docs/PLANNING.md` with the relevant section
- Add an ADR in `docs/adr/` if it's a technology/architecture decision
- Update this `CLAUDE.md` if it changes conventions
- Update `docs/CHANGELOG.md` with a dated entry

### 2. Bilingual (Vietnamese + English)

- All UI strings MUST go through i18n (`packages/i18n/locales/vi/` and `en/`)
- NEVER hardcode user-visible strings in components
- Medical terms may remain in English/Latin even in Vietnamese context (CT, MRI, DICOM)
- Code comments, variable names, API paths, filenames: always English

### 3. Testing is Mandatory

- Every service MUST have a `tests/` directory
- Unit tests for all business logic (target: 80%+ coverage)
- Integration tests for API endpoints
- Test files follow pattern: `*.spec.ts` (NestJS), `test_*.py` (Python)
- Run tests before committing: `pnpm test`

### 4. Type Safety

- TypeScript strict mode for all Node.js code
- Pydantic models for all Python API schemas
- Shared types in `packages/types/` — import from there, never duplicate
- No `any` types unless explicitly justified with a comment

## Architecture

### Monorepo Structure

```
MedicalPower/
├── apps/           # Frontend applications (Next.js, OHIF)
├── services/       # Backend microservices (NestJS, FastAPI)
├── packages/       # Shared libraries (types, ui, i18n, config)
├── vendor/         # Git submodules (OHIF Viewers, MONAI Label)
├── infra/          # Infrastructure (Docker, K8s, Orthanc, Keycloak)
├── tests/          # Cross-service integration tests
├── scripts/        # Development and deployment scripts
└── docs/           # Documentation (bilingual vi/en)
```

### Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Portal Frontend | Next.js + TailwindCSS + shadcn/ui | 16.x |
| OHIF Viewer | OHIF Viewers (submodule) | v3.12.0 |
| Backend Services | NestJS | 10.x |
| AI/Inference | FastAPI + MONAI Label | 0.8.5 |
| Database | PostgreSQL | 16.x |
| Cache | Redis | 7.x |
| Message Queue | RabbitMQ | 3.13.x |
| DICOM Server | Orthanc | 1.12.x |
| Object Storage | MinIO | latest |
| Auth | Keycloak | 25.x |
| ORM | Prisma (TS) / SQLAlchemy (Python) | 5.x / 2.x |

### Database Connection

```
Host:     localhost (or postgres in Docker network)
Port:     5432
Database: medicalpower
User:     mp_admin
Password: mp_secret_dev (dev only)
```

Databases:
- `medicalpower` — application data (patients, cases, tasks, etc.)
- `orthanc` — DICOM index (managed by Orthanc, do not modify directly)
- `keycloak` — auth data (managed by Keycloak, do not modify directly)

### Service Ports

| Service | Port | Status |
|---------|------|--------|
| Portal Web | 3000 | Active |
| OHIF Viewer | 3001 | Needs build |
| Admin Web | 3002 | Placeholder |
| API Gateway | 4000 | Placeholder |
| identity-service | 4001 | Placeholder |
| patient-service | 4002 | Placeholder |
| case-service | 4003 | Placeholder |
| study-service | 4004 | Placeholder |
| annotation-service | 4005 | Placeholder |
| workflow-service | 4006 | Placeholder |
| diagnosis-service | 4007 | Placeholder |
| report-service | 4008 | Placeholder |
| notification-service | 4009 | Placeholder |
| audit-service | 4010 | Placeholder |
| integration-service | 4011 | Placeholder |
| segmentation-service | 5000 | Scaffolded |
| MONAI Label | 8000 | Docker (GPU) |
| Orthanc | 8042 | Active |
| Orthanc DICOM | 4242 | Active |
| Keycloak | 8080 | Docker |
| PostgreSQL | 5432 | Active |
| Redis | 6379 | Active |
| RabbitMQ | 5672/15672 | Docker |
| MinIO | 9000/9001 | Docker |

## Coding Conventions

### File Naming
- React components: `PascalCase.tsx` (e.g., `PatientList.tsx`)
- Pages (Next.js App Router): `page.tsx`, `layout.tsx`
- NestJS modules: `kebab-case` directories (e.g., `patient/patient.service.ts`)
- Python: `snake_case.py`
- Tests: `*.spec.ts` (TS), `test_*.py` (Python)
- i18n keys: `namespace.context.element` (e.g., `patient.field.fullName`)

### Git Commit Messages
Format: `<type>: <description>`

Types:
- `feat:` new feature
- `fix:` bug fix
- `refactor:` code change that neither fixes a bug nor adds a feature
- `docs:` documentation changes
- `test:` adding or updating tests
- `infra:` infrastructure/deployment changes
- `chore:` maintenance tasks

### API Design
- REST endpoints: `/api/v1/<resource>`
- Plural nouns: `/api/v1/patients`, `/api/v1/cases`
- Use HTTP methods correctly: GET (read), POST (create), PATCH (update), DELETE (delete)
- Always return consistent error format: `{ error: { code, message, message_key, trace_id } }`
- Pagination: `?page=1&limit=20`
- Filtering: `?status=active&priority=high`

### Database Schema
- Table names: `snake_case`, plural (e.g., `patients`, `cases`, `tasks`)
- Primary keys: `id` (UUID)
- Timestamps: `created_at`, `updated_at` (auto-managed)
- Soft delete: `deleted_at` (nullable timestamp)
- Organization scoping: `org_id` on every tenant-scoped table
- Use Prisma for migrations in NestJS services

## Sample DICOM Data

| Patient | Study | Modality | Description | Instances |
|---------|-------|----------|-------------|-----------|
| BUI TRONG TINH | 1.2.840.113704.1.111.13428.1678778829.1 | CT | C-Spine with contrast (Abscess) | 598 |

Hospital: BV Thống Nhất | Referring: Dr. Đỗ Bảo Ngọc | Date: 2023-03-14

## Infrastructure Commands

```bash
# Start all infrastructure
cd infra/docker && docker compose -f docker-compose.dev.yml up -d

# Start with GPU (MONAI Label)
cd infra/docker && docker compose -f docker-compose.dev.yml --profile gpu up -d

# Upload DICOM data
./scripts/upload-dicom.sh /path/to/dicom/folder

# Run portal dev server
cd apps/portal-web && npm run dev

# Run tests
pnpm test

# Check services
docker compose -f infra/docker/docker-compose.dev.yml ps
```

## Architecture Decision Log (Quick Reference)

| # | Decision | Chosen | Alternative | Reason |
|---|----------|--------|-------------|--------|
| 001 | DICOM Backend | Orthanc | dcm4chee | Simpler ops, sufficient for MVP |
| 002 | Workflow Engine | Custom → Temporal | Camunda, n8n | Full control for MVP, migrate later |
| 003 | Backend API | NestJS + FastAPI | Spring Boot | TS alignment + Python for AI |
| 004 | Frontend | Next.js App Router | React SPA | SSR, i18n routing, BFF |
| 005 | Auth | Keycloak | Auth0 | Self-hosted, data sovereignty |
| 006 | Database | PostgreSQL + JSONB | MongoDB | Relational integrity for clinical data |
| 007 | Queue | RabbitMQ → Kafka | Redis Streams | Reliable delivery, DLQ support |
| 008 | Object Storage | MinIO | S3 | Self-hosted, S3-compatible |
| 009 | AI Serving | MONAI Label → Deploy | Triton | Native interactive segmentation |
| 010 | Monorepo | Turborepo + pnpm | Nx | Simpler config, sufficient features |
