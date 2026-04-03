---
name: case
description: "Skill for the Case area of MedicalPower. 8 symbols across 3 files."
---

# Case

8 symbols | 3 files | Cohesion: 100%

## When to Use

- Working with code in `services/`
- Understanding how findOne, create, update work
- Modifying case-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `services/workflow-service/src/case/case.service.ts` | findOne, create, update, softDelete, ensureExists (+1) |
| `services/workflow-service/src/case/case.controller.ts` | remove |
| `services/workflow-service/src/case/dashboard.controller.ts` | getStats |

## Entry Points

Start here when exploring this area:

- **`findOne`** (Method) — `services/workflow-service/src/case/case.service.ts:75`
- **`create`** (Method) — `services/workflow-service/src/case/case.service.ts:84`
- **`update`** (Method) — `services/workflow-service/src/case/case.service.ts:132`
- **`softDelete`** (Method) — `services/workflow-service/src/case/case.service.ts:178`
- **`ensureExists`** (Method) — `services/workflow-service/src/case/case.service.ts:236`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `findOne` | Method | `services/workflow-service/src/case/case.service.ts` | 75 |
| `create` | Method | `services/workflow-service/src/case/case.service.ts` | 84 |
| `update` | Method | `services/workflow-service/src/case/case.service.ts` | 132 |
| `softDelete` | Method | `services/workflow-service/src/case/case.service.ts` | 178 |
| `ensureExists` | Method | `services/workflow-service/src/case/case.service.ts` | 236 |
| `remove` | Method | `services/workflow-service/src/case/case.controller.ts` | 76 |
| `getStats` | Method | `services/workflow-service/src/case/dashboard.controller.ts` | 11 |
| `getDashboardStats` | Method | `services/workflow-service/src/case/case.service.ts` | 187 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Remove → EnsureExists` | intra_community | 3 |

## How to Explore

1. `gitnexus_context({name: "findOne"})` — see callers and callees
2. `gitnexus_query({query: "case"})` — find related execution flows
3. Read key files listed above for implementation details
