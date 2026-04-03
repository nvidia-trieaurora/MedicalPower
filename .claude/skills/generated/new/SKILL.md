---
name: new
description: "Skill for the New area of MedicalPower. 6 symbols across 4 files."
---

# New

6 symbols | 4 files | Cohesion: 50%

## When to Use

- Working with code in `apps/`
- Understanding how NotificationProvider, useToast, NewCasePage work
- Modifying new-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `apps/portal-web/src/app/cases/new/page.tsx` | NewCasePage, handleSelectPatient, toggleStudy |
| `apps/portal-web/src/lib/notification-context.tsx` | NotificationProvider |
| `apps/portal-web/src/components/ui/toast.tsx` | useToast |
| `apps/portal-web/src/app/cases/[id]/edit/page.tsx` | EditCasePage |

## Entry Points

Start here when exploring this area:

- **`NotificationProvider`** (Function) — `apps/portal-web/src/lib/notification-context.tsx:23`
- **`useToast`** (Function) — `apps/portal-web/src/components/ui/toast.tsx:21`
- **`NewCasePage`** (Function) — `apps/portal-web/src/app/cases/new/page.tsx:23`
- **`handleSelectPatient`** (Function) — `apps/portal-web/src/app/cases/new/page.tsx:53`
- **`toggleStudy`** (Function) — `apps/portal-web/src/app/cases/new/page.tsx:59`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `NotificationProvider` | Function | `apps/portal-web/src/lib/notification-context.tsx` | 23 |
| `useToast` | Function | `apps/portal-web/src/components/ui/toast.tsx` | 21 |
| `NewCasePage` | Function | `apps/portal-web/src/app/cases/new/page.tsx` | 23 |
| `handleSelectPatient` | Function | `apps/portal-web/src/app/cases/new/page.tsx` | 53 |
| `toggleStudy` | Function | `apps/portal-web/src/app/cases/new/page.tsx` | 59 |
| `EditCasePage` | Function | `apps/portal-web/src/app/cases/[id]/edit/page.tsx` | 30 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Notifications | 2 calls |
| Admin | 2 calls |

## How to Explore

1. `gitnexus_context({name: "NotificationProvider"})` — see callers and callees
2. `gitnexus_query({query: "new"})` — find related execution flows
3. Read key files listed above for implementation details
