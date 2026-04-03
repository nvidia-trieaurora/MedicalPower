---
name: app
description: "Skill for the App area of MedicalPower. 6 symbols across 1 files."
---

# App

6 symbols | 1 files | Cohesion: 83%

## When to Use

- Working with code in `apps/`
- Understanding how DashboardPage, load work
- Modifying app-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `apps/portal-web/src/app/page.tsx` | casePatientDisplay, taskCaseTitle, taskPatientName, taskModality, DashboardPage (+1) |

## Entry Points

Start here when exploring this area:

- **`DashboardPage`** (Function) — `apps/portal-web/src/app/page.tsx:80`
- **`load`** (Function) — `apps/portal-web/src/app/page.tsx:90`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `DashboardPage` | Function | `apps/portal-web/src/app/page.tsx` | 80 |
| `load` | Function | `apps/portal-web/src/app/page.tsx` | 90 |
| `casePatientDisplay` | Function | `apps/portal-web/src/app/page.tsx` | 54 |
| `taskCaseTitle` | Function | `apps/portal-web/src/app/page.tsx` | 60 |
| `taskPatientName` | Function | `apps/portal-web/src/app/page.tsx` | 66 |
| `taskModality` | Function | `apps/portal-web/src/app/page.tsx` | 72 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Admin | 2 calls |

## How to Explore

1. `gitnexus_context({name: "DashboardPage"})` — see callers and callees
2. `gitnexus_query({query: "app"})` — find related execution flows
3. Read key files listed above for implementation details
