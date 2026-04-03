---
name: patients
description: "Skill for the Patients area of MedicalPower. 4 symbols across 1 files."
---

# Patients

4 symbols | 1 files | Cohesion: 60%

## When to Use

- Working with code in `apps/`
- Understanding how PatientsPage, handleEdit, handleSaveEdit work
- Modifying patients-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `apps/portal-web/src/app/patients/page.tsx` | PatientsPage, handleEdit, handleSaveEdit, handleDelete |

## Entry Points

Start here when exploring this area:

- **`PatientsPage`** (Function) — `apps/portal-web/src/app/patients/page.tsx:19`
- **`handleEdit`** (Function) — `apps/portal-web/src/app/patients/page.tsx:57`
- **`handleSaveEdit`** (Function) — `apps/portal-web/src/app/patients/page.tsx:62`
- **`handleDelete`** (Function) — `apps/portal-web/src/app/patients/page.tsx:74`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `PatientsPage` | Function | `apps/portal-web/src/app/patients/page.tsx` | 19 |
| `handleEdit` | Function | `apps/portal-web/src/app/patients/page.tsx` | 57 |
| `handleSaveEdit` | Function | `apps/portal-web/src/app/patients/page.tsx` | 62 |
| `handleDelete` | Function | `apps/portal-web/src/app/patients/page.tsx` | 74 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Admin | 2 calls |
| New | 1 calls |
| Workflows | 1 calls |

## How to Explore

1. `gitnexus_context({name: "PatientsPage"})` — see callers and callees
2. `gitnexus_query({query: "patients"})` — find related execution flows
3. Read key files listed above for implementation details
