---
name: admin
description: "Skill for the Admin area of MedicalPower. 32 symbols across 18 files."
---

# Admin

32 symbols | 18 files | Cohesion: 77%

## When to Use

- Working with code in `apps/`
- Understanding how getViewerUrl, t, LocaleProvider work
- Modifying admin-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `apps/portal-web/src/components/admin/ServiceLogPanel.tsx` | getServiceKey, useResizable, ServiceLogPanel, formatTimestamp |
| `services/workflow-service/src/task/task.service.ts` | findById, transition, getAllowedActions |
| `apps/portal-web/src/app/login/page.tsx` | LoginPage, handleSubmit, quickLogin |
| `apps/portal-web/src/app/tasks/[id]/page.tsx` | TaskDetailPage, fetchTask, handleTransition |
| `apps/portal-web/src/app/admin/users/page.tsx` | UsersPage, toggleBlock, deleteUser |
| `apps/portal-web/src/lib/locale-context.tsx` | LocaleProvider, useLocale |
| `apps/portal-web/src/components/layout/header.tsx` | getInitials, Header |
| `apps/portal-web/src/app/admin/system/page.tsx` | SystemPage, handleServiceClick |
| `apps/portal-web/src/lib/viewer.ts` | getViewerUrl |
| `apps/portal-web/src/lib/i18n.ts` | t |

## Entry Points

Start here when exploring this area:

- **`getViewerUrl`** (Function) — `apps/portal-web/src/lib/viewer.ts:5`
- **`t`** (Function) — `apps/portal-web/src/lib/i18n.ts:24`
- **`LocaleProvider`** (Function) — `apps/portal-web/src/lib/locale-context.tsx:16`
- **`useLocale`** (Function) — `apps/portal-web/src/lib/locale-context.tsx:55`
- **`login`** (Function) — `apps/portal-web/src/lib/auth-context.tsx:36`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `getViewerUrl` | Function | `apps/portal-web/src/lib/viewer.ts` | 5 |
| `t` | Function | `apps/portal-web/src/lib/i18n.ts` | 24 |
| `LocaleProvider` | Function | `apps/portal-web/src/lib/locale-context.tsx` | 16 |
| `useLocale` | Function | `apps/portal-web/src/lib/locale-context.tsx` | 55 |
| `login` | Function | `apps/portal-web/src/lib/auth-context.tsx` | 36 |
| `LandingRedirect` | Function | `apps/portal-web/src/components/layout/landing-redirect.tsx` | 8 |
| `Header` | Function | `apps/portal-web/src/components/layout/header.tsx` | 21 |
| `AppShell` | Function | `apps/portal-web/src/components/layout/app-shell.tsx` | 16 |
| `getServiceKey` | Function | `apps/portal-web/src/components/admin/ServiceLogPanel.tsx` | 71 |
| `ServiceLogPanel` | Function | `apps/portal-web/src/components/admin/ServiceLogPanel.tsx` | 137 |
| `LoginPage` | Function | `apps/portal-web/src/app/login/page.tsx` | 11 |
| `handleSubmit` | Function | `apps/portal-web/src/app/login/page.tsx` | 20 |
| `quickLogin` | Function | `apps/portal-web/src/app/login/page.tsx` | 34 |
| `AdminDashboardPage` | Function | `apps/portal-web/src/app/admin/page.tsx` | 14 |
| `TaskDetailPage` | Function | `apps/portal-web/src/app/tasks/[id]/page.tsx` | 25 |
| `fetchTask` | Function | `apps/portal-web/src/app/tasks/[id]/page.tsx` | 34 |
| `handleTransition` | Function | `apps/portal-web/src/app/tasks/[id]/page.tsx` | 44 |
| `PatientDetailPage` | Function | `apps/portal-web/src/app/patients/[id]/page.tsx` | 13 |
| `CaseDetailPage` | Function | `apps/portal-web/src/app/cases/[id]/page.tsx` | 25 |
| `UsersPage` | Function | `apps/portal-web/src/app/admin/users/page.tsx` | 59 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `WorkflowsPage → T` | cross_community | 3 |
| `LoginPage → Login` | intra_community | 3 |
| `SystemPage → GetServiceKey` | intra_community | 3 |
| `HandleTransition → FindById` | intra_community | 3 |
| `HandleTransition → FindById` | intra_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Notifications | 3 calls |
| New | 2 calls |
| Workflows | 1 calls |

## How to Explore

1. `gitnexus_context({name: "getViewerUrl"})` — see callers and callees
2. `gitnexus_query({query: "admin"})` — find related execution flows
3. Read key files listed above for implementation details
