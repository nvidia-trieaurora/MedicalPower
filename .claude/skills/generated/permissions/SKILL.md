---
name: permissions
description: "Skill for the Permissions area of MedicalPower. 7 symbols across 2 files."
---

# Permissions

7 symbols | 2 files | Cohesion: 80%

## When to Use

- Working with code in `apps/`
- Understanding how PermissionsPage, handleToggle, handleSelect work
- Modifying permissions-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `apps/portal-web/src/app/admin/permissions/page.tsx` | fuzzyMatch, PermissionsPage, handleToggle, handleSelect, handleGrant |
| `services/workflow-service/src/permission/permission.service.ts` | grant, revoke |

## Entry Points

Start here when exploring this area:

- **`PermissionsPage`** (Function) — `apps/portal-web/src/app/admin/permissions/page.tsx:38`
- **`handleToggle`** (Function) — `apps/portal-web/src/app/admin/permissions/page.tsx:85`
- **`handleSelect`** (Function) — `apps/portal-web/src/app/admin/permissions/page.tsx:96`
- **`handleGrant`** (Function) — `apps/portal-web/src/app/admin/permissions/page.tsx:99`
- **`grant`** (Method) — `services/workflow-service/src/permission/permission.service.ts:66`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `PermissionsPage` | Function | `apps/portal-web/src/app/admin/permissions/page.tsx` | 38 |
| `handleToggle` | Function | `apps/portal-web/src/app/admin/permissions/page.tsx` | 85 |
| `handleSelect` | Function | `apps/portal-web/src/app/admin/permissions/page.tsx` | 96 |
| `handleGrant` | Function | `apps/portal-web/src/app/admin/permissions/page.tsx` | 99 |
| `grant` | Method | `services/workflow-service/src/permission/permission.service.ts` | 66 |
| `revoke` | Method | `services/workflow-service/src/permission/permission.service.ts` | 85 |
| `fuzzyMatch` | Function | `apps/portal-web/src/app/admin/permissions/page.tsx` | 26 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `PermissionsPage → GetDefaultPermissions` | cross_community | 4 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Admin | 1 calls |
| Notifications | 1 calls |
| Permission | 1 calls |

## How to Explore

1. `gitnexus_context({name: "PermissionsPage"})` — see callers and callees
2. `gitnexus_query({query: "permissions"})` — find related execution flows
3. Read key files listed above for implementation details
