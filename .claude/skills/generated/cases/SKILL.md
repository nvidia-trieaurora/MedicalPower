---
name: cases
description: "Skill for the Cases area of MedicalPower. 4 symbols across 1 files."
---

# Cases

4 symbols | 1 files | Cohesion: 67%

## When to Use

- Working with code in `apps/`
- Understanding how CasesPage, fetchCases, handleDelete work
- Modifying cases-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `apps/portal-web/src/app/cases/page.tsx` | patientDisplay, CasesPage, fetchCases, handleDelete |

## Entry Points

Start here when exploring this area:

- **`CasesPage`** (Function) — `apps/portal-web/src/app/cases/page.tsx:36`
- **`fetchCases`** (Function) — `apps/portal-web/src/app/cases/page.tsx:49`
- **`handleDelete`** (Function) — `apps/portal-web/src/app/cases/page.tsx:78`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `CasesPage` | Function | `apps/portal-web/src/app/cases/page.tsx` | 36 |
| `fetchCases` | Function | `apps/portal-web/src/app/cases/page.tsx` | 49 |
| `handleDelete` | Function | `apps/portal-web/src/app/cases/page.tsx` | 78 |
| `patientDisplay` | Function | `apps/portal-web/src/app/cases/page.tsx` | 34 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Admin | 2 calls |
| New | 1 calls |
| Workflows | 1 calls |

## How to Explore

1. `gitnexus_context({name: "CasesPage"})` — see callers and callees
2. `gitnexus_query({query: "cases"})` — find related execution flows
3. Read key files listed above for implementation details
