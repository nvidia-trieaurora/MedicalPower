---
name: notifications
description: "Skill for the Notifications area of MedicalPower. 9 symbols across 8 files."
---

# Notifications

9 symbols | 8 files | Cohesion: 65%

## When to Use

- Working with code in `apps/`
- Understanding how usePermissions, SocketProvider, useNotifications work
- Modifying notifications-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `apps/portal-web/src/app/notifications/page.tsx` | NotificationsPage, handleMarkRead |
| `apps/portal-web/src/hooks/use-permissions.ts` | usePermissions |
| `apps/portal-web/src/lib/socket-context.tsx` | SocketProvider |
| `apps/portal-web/src/lib/notification-context.tsx` | useNotifications |
| `apps/portal-web/src/lib/auth-context.tsx` | useAuth |
| `apps/portal-web/src/components/layout/sidebar.tsx` | Sidebar |
| `apps/portal-web/src/components/guards/PermissionGuard.tsx` | PermissionGuard |
| `apps/portal-web/src/app/admin/layout.tsx` | AdminLayout |

## Entry Points

Start here when exploring this area:

- **`usePermissions`** (Function) — `apps/portal-web/src/hooks/use-permissions.ts:7`
- **`SocketProvider`** (Function) — `apps/portal-web/src/lib/socket-context.tsx:21`
- **`useNotifications`** (Function) — `apps/portal-web/src/lib/notification-context.tsx:21`
- **`useAuth`** (Function) — `apps/portal-web/src/lib/auth-context.tsx:62`
- **`Sidebar`** (Function) — `apps/portal-web/src/components/layout/sidebar.tsx:32`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `usePermissions` | Function | `apps/portal-web/src/hooks/use-permissions.ts` | 7 |
| `SocketProvider` | Function | `apps/portal-web/src/lib/socket-context.tsx` | 21 |
| `useNotifications` | Function | `apps/portal-web/src/lib/notification-context.tsx` | 21 |
| `useAuth` | Function | `apps/portal-web/src/lib/auth-context.tsx` | 62 |
| `Sidebar` | Function | `apps/portal-web/src/components/layout/sidebar.tsx` | 32 |
| `PermissionGuard` | Function | `apps/portal-web/src/components/guards/PermissionGuard.tsx` | 28 |
| `NotificationsPage` | Function | `apps/portal-web/src/app/notifications/page.tsx` | 15 |
| `handleMarkRead` | Function | `apps/portal-web/src/app/notifications/page.tsx` | 37 |
| `AdminLayout` | Function | `apps/portal-web/src/app/admin/layout.tsx` | 6 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Sidebar → UseAuth` | intra_community | 3 |
| `PermissionGuard → UseAuth` | intra_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Admin | 3 calls |
| Ui | 1 calls |

## How to Explore

1. `gitnexus_context({name: "usePermissions"})` — see callers and callees
2. `gitnexus_query({query: "notifications"})` — find related execution flows
3. Read key files listed above for implementation details
