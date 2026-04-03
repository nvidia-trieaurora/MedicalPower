---
name: tasks
description: "Skill for the Tasks area of MedicalPower. 9 symbols across 1 files."
---

# Tasks

9 symbols | 1 files | Cohesion: 68%

## When to Use

- Working with code in `apps/`
- Understanding how TasksPage, refreshTasks, filterByType work
- Modifying tasks-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `apps/portal-web/src/app/tasks/page.tsx` | getCaseTitle, getPatientName, getStudyUid, getModality, TaskCard (+4) |

## Entry Points

Start here when exploring this area:

- **`TasksPage`** (Function) — `apps/portal-web/src/app/tasks/page.tsx:174`
- **`refreshTasks`** (Function) — `apps/portal-web/src/app/tasks/page.tsx:179`
- **`filterByType`** (Function) — `apps/portal-web/src/app/tasks/page.tsx:196`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `TasksPage` | Function | `apps/portal-web/src/app/tasks/page.tsx` | 174 |
| `refreshTasks` | Function | `apps/portal-web/src/app/tasks/page.tsx` | 179 |
| `filterByType` | Function | `apps/portal-web/src/app/tasks/page.tsx` | 196 |
| `getCaseTitle` | Function | `apps/portal-web/src/app/tasks/page.tsx` | 24 |
| `getPatientName` | Function | `apps/portal-web/src/app/tasks/page.tsx` | 30 |
| `getStudyUid` | Function | `apps/portal-web/src/app/tasks/page.tsx` | 36 |
| `getModality` | Function | `apps/portal-web/src/app/tasks/page.tsx` | 42 |
| `TaskCard` | Function | `apps/portal-web/src/app/tasks/page.tsx` | 73 |
| `getAssignedToName` | Function | `apps/portal-web/src/app/tasks/page.tsx` | 48 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Admin | 6 calls |
| New | 1 calls |

## How to Explore

1. `gitnexus_context({name: "TasksPage"})` — see callers and callees
2. `gitnexus_query({query: "tasks"})` — find related execution flows
3. Read key files listed above for implementation details
