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

### 2. Bilingual (Vietnamese + English) — MANDATORY

**Every PR/commit that adds or modifies UI MUST follow these rules:**

- All user-visible strings MUST go through i18n (`packages/i18n/locales/vi/` and `en/`)
- NEVER hardcode Vietnamese or English text directly in components
- Medical terms may remain in English/Latin even in Vietnamese context (CT, MRI, DICOM)
- Code comments, variable names, API paths, filenames: always English

**i18n Architecture:**
- `LocaleProvider` (in `apps/portal-web/src/lib/locale-context.tsx`) wraps the entire app in `layout.tsx`
- Single source of truth for locale state — all components share the same locale via React Context
- `useLocale()` hook returns `{ locale, setLocale, toggleLocale, t }` — use this everywhere
- Import from either `@/lib/locale-context` or `@/hooks/use-locale` (re-export)
- Language toggle in Header and Login page; stored in `localStorage` key `mp_locale`
- `document.documentElement.lang` is updated automatically when locale changes
- Fallback chain: requested locale → English → raw key

**i18n Checklist (before committing):**
1. Add keys to BOTH `packages/i18n/locales/vi/<namespace>.json` AND `en/<namespace>.json`
2. Use `const { t } = useLocale()` in components, never raw strings
3. Keep keys in the correct namespace file (don't put `case.*` keys in `common.json`)
4. Verify both languages render correctly (click VI/EN toggle)
5. Landing page, login page, admin pages — ALL must be bilingual
6. Error messages, notifications, tooltips — ALL must be translated
7. Date formatting must be locale-aware: `toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US')`
8. Don't store translated strings in state — store a key/sentinel and translate in JSX

**Namespace conventions (each has its own JSON file):**
- `common` — shared UI (nav, buttons, pagination, status labels, actions)
- `patient` — patient module
- `case` — case module
- `workflow` — workflow/task module (includes task types, statuses, dashboard stats)
- `annotation` — DICOM annotation tools
- `medical` — medical terminology
- `admin` — admin dashboard, user management, system monitoring
- `auth` — login, logout, landing page, permissions

**How to use in components:**
```tsx
import { useLocale } from '@/lib/locale-context';

function MyComponent() {
  const { t, locale } = useLocale();
  return (
    <div>
      <h1>{t('patient.title')}</h1>
      <p>{t('patient.list.count', { count: String(total) })}</p>
      <span>{new Date(date).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US')}</span>
    </div>
  );
}
```

**Adding a new i18n key (step by step):**
1. Add key + English value to `packages/i18n/locales/en/<namespace>.json`
2. Add key + Vietnamese value to `packages/i18n/locales/vi/<namespace>.json`
3. Use `t('namespace.key')` or `t('namespace.key', { param: value })` in your component
4. If the namespace JSON file is not yet imported in `apps/portal-web/src/lib/i18n.ts`, add the import there

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
| OHIF Viewer | 3001 | Active |
| Admin (in Portal) | 3000/admin | Active |
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

## Sample DICOM Data (Real Clinical — BV Thống Nhất)

| Patient | MRN | StudyInstanceUID | Modality | Description | Date | Instances |
|---------|-----|------------------|----------|-------------|------|-----------|
| BÙI TRỌNG TÌNH | 23057406 | 1.2.840.113704.1.111.13428.1678778829.1 | CT | C-Spine with contrast | 2023-03-14 | 598 |
| BÙI TRỌNG TÌNH | 23057406 | 1.2.840.113704.1.111.11228.1696305185.1 | CT | C-Spine with contrast (follow-up) | 2023-10-03 | 520 |
| BÙI VIẾT LÂM | 15122510 | 1.2.840.113704.1.111.9072.1552979082.1 | CT | Maxillofacial with contrast | 2019-03-19 | 341 |
| BÙI THẾ THIÊM | 13093945 | 1.2.840.113704.1.111.9500.1681976622.1 | CT | C-Spine with contrast | 2023-04-20 | 457 |
| BÙI THẾ THIÊM | 13093945 | 1.2.840.113704.1.111.5364.1685941505.1 | CT | C-Spine with contrast (follow-up) | 2023-06-05 | 487 |

Total: 3 patients, 5 studies, 2,403 instances | Hospital: BV Thống Nhất

Upload: `./scripts/upload-all-patients.sh`

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

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **MedicalPower** (1557 symbols, 2789 relationships, 23 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/MedicalPower/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept | `gitnexus_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `gitnexus_cypher({query: "MATCH ..."})` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/MedicalPower/context` | Codebase overview, check index freshness |
| `gitnexus://repo/MedicalPower/clusters` | All functional areas |
| `gitnexus://repo/MedicalPower/processes` | All execution flows |
| `gitnexus://repo/MedicalPower/process/{name}` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the GitNexus index becomes stale. Re-run analyze to update it:

```bash
npx gitnexus analyze
```

If the index previously included embeddings, preserve them by adding `--embeddings`:

```bash
npx gitnexus analyze --embeddings
```

To check whether embeddings exist, inspect `.gitnexus/meta.json` — the `stats.embeddings` field shows the count (0 means no embeddings). **Running analyze without `--embeddings` will delete any previously generated embeddings.**

> Claude Code users: A PostToolUse hook handles this automatically after `git commit` and `git merge`.

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |
| Work in the Ui area (65 symbols) | `.claude/skills/generated/ui/SKILL.md` |
| Work in the Admin area (32 symbols) | `.claude/skills/generated/admin/SKILL.md` |
| Work in the Services area (21 symbols) | `.claude/skills/generated/services/SKILL.md` |
| Work in the Unit area (15 symbols) | `.claude/skills/generated/unit/SKILL.md` |
| Work in the Notifications area (9 symbols) | `.claude/skills/generated/notifications/SKILL.md` |
| Work in the Permission area (9 symbols) | `.claude/skills/generated/permission/SKILL.md` |
| Work in the Tasks area (9 symbols) | `.claude/skills/generated/tasks/SKILL.md` |
| Work in the Engine area (8 symbols) | `.claude/skills/generated/engine/SKILL.md` |
| Work in the Case area (8 symbols) | `.claude/skills/generated/case/SKILL.md` |
| Work in the Permissions area (7 symbols) | `.claude/skills/generated/permissions/SKILL.md` |
| Work in the New area (6 symbols) | `.claude/skills/generated/new/SKILL.md` |
| Work in the App area (6 symbols) | `.claude/skills/generated/app/SKILL.md` |
| Work in the Patient area (4 symbols) | `.claude/skills/generated/patient/SKILL.md` |
| Work in the Task area (4 symbols) | `.claude/skills/generated/task/SKILL.md` |
| Work in the Workflows area (4 symbols) | `.claude/skills/generated/workflows/SKILL.md` |
| Work in the Cluster_52 area (4 symbols) | `.claude/skills/generated/cluster-52/SKILL.md` |
| Work in the Patients area (4 symbols) | `.claude/skills/generated/patients/SKILL.md` |
| Work in the Cases area (4 symbols) | `.claude/skills/generated/cases/SKILL.md` |
| Work in the Sync area (4 symbols) | `.claude/skills/generated/sync/SKILL.md` |
| Work in the Workflow area (4 symbols) | `.claude/skills/generated/workflow/SKILL.md` |

<!-- gitnexus:end -->
