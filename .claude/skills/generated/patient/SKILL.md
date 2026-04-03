---
name: patient
description: "Skill for the Patient area of MedicalPower. 4 symbols across 2 files."
---

# Patient

4 symbols | 2 files | Cohesion: 100%

## When to Use

- Working with code in `services/`
- Understanding how findOne, update, softDelete work
- Modifying patient-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `services/patient-service/src/patient/patient.service.ts` | findOne, update, softDelete |
| `services/patient-service/src/patient/patient.controller.ts` | remove |

## Entry Points

Start here when exploring this area:

- **`findOne`** (Method) — `services/patient-service/src/patient/patient.service.ts:83`
- **`update`** (Method) — `services/patient-service/src/patient/patient.service.ts:110`
- **`softDelete`** (Method) — `services/patient-service/src/patient/patient.service.ts:126`
- **`remove`** (Method) — `services/patient-service/src/patient/patient.controller.ts:67`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `findOne` | Method | `services/patient-service/src/patient/patient.service.ts` | 83 |
| `update` | Method | `services/patient-service/src/patient/patient.service.ts` | 110 |
| `softDelete` | Method | `services/patient-service/src/patient/patient.service.ts` | 126 |
| `remove` | Method | `services/patient-service/src/patient/patient.controller.ts` | 67 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Remove → FindOne` | intra_community | 3 |

## How to Explore

1. `gitnexus_context({name: "findOne"})` — see callers and callees
2. `gitnexus_query({query: "patient"})` — find related execution flows
3. Read key files listed above for implementation details
