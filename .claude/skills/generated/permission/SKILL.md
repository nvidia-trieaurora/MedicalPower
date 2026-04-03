---
name: permission
description: "Skill for the Permission area of MedicalPower. 9 symbols across 3 files."
---

# Permission

9 symbols | 3 files | Cohesion: 76%

## When to Use

- Working with code in `services/`
- Understanding how NewTaskPage, handleSelectPatient, getDefaultPermissions work
- Modifying permission-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `services/workflow-service/src/permission/permission.service.ts` | getDefaultPermissions, getEffectivePermissions, hasPermission, getUserPermissions, listUsersWithPermissions |
| `services/workflow-service/src/permission/permission.controller.ts` | check, listUsers |
| `apps/portal-web/src/app/tasks/new/page.tsx` | NewTaskPage, handleSelectPatient |

## Entry Points

Start here when exploring this area:

- **`NewTaskPage`** (Function) — `apps/portal-web/src/app/tasks/new/page.tsx:34`
- **`handleSelectPatient`** (Function) — `apps/portal-web/src/app/tasks/new/page.tsx:109`
- **`getDefaultPermissions`** (Method) — `services/workflow-service/src/permission/permission.service.ts:18`
- **`getEffectivePermissions`** (Method) — `services/workflow-service/src/permission/permission.service.ts:22`
- **`hasPermission`** (Method) — `services/workflow-service/src/permission/permission.service.ts:40`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `NewTaskPage` | Function | `apps/portal-web/src/app/tasks/new/page.tsx` | 34 |
| `handleSelectPatient` | Function | `apps/portal-web/src/app/tasks/new/page.tsx` | 109 |
| `getDefaultPermissions` | Method | `services/workflow-service/src/permission/permission.service.ts` | 18 |
| `getEffectivePermissions` | Method | `services/workflow-service/src/permission/permission.service.ts` | 22 |
| `hasPermission` | Method | `services/workflow-service/src/permission/permission.service.ts` | 40 |
| `getUserPermissions` | Method | `services/workflow-service/src/permission/permission.service.ts` | 45 |
| `check` | Method | `services/workflow-service/src/permission/permission.controller.ts` | 23 |
| `listUsersWithPermissions` | Method | `services/workflow-service/src/permission/permission.service.ts` | 97 |
| `listUsers` | Method | `services/workflow-service/src/permission/permission.controller.ts` | 11 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `NewTaskPage → GetDefaultPermissions` | cross_community | 4 |
| `PermissionsPage → GetDefaultPermissions` | cross_community | 4 |
| `Check → GetDefaultPermissions` | intra_community | 4 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Admin | 1 calls |
| New | 1 calls |

## How to Explore

1. `gitnexus_context({name: "NewTaskPage"})` — see callers and callees
2. `gitnexus_query({query: "permission"})` — find related execution flows
3. Read key files listed above for implementation details
