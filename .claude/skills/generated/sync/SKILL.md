---
name: sync
description: "Skill for the Sync area of MedicalPower. 4 symbols across 1 files."
---

# Sync

4 symbols | 1 files | Cohesion: 100%

## When to Use

- Working with code in `apps/`
- Understanding how POST, GET work
- Modifying sync-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `apps/portal-web/src/app/api/studies/sync/route.ts` | POST, GET, fetchOrthanc, parseDate |

## Entry Points

Start here when exploring this area:

- **`POST`** (Function) — `apps/portal-web/src/app/api/studies/sync/route.ts:34`
- **`GET`** (Function) — `apps/portal-web/src/app/api/studies/sync/route.ts:94`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `POST` | Function | `apps/portal-web/src/app/api/studies/sync/route.ts` | 34 |
| `GET` | Function | `apps/portal-web/src/app/api/studies/sync/route.ts` | 94 |
| `fetchOrthanc` | Function | `apps/portal-web/src/app/api/studies/sync/route.ts` | 126 |
| `parseDate` | Function | `apps/portal-web/src/app/api/studies/sync/route.ts` | 134 |

## How to Explore

1. `gitnexus_context({name: "POST"})` — see callers and callees
2. `gitnexus_query({query: "sync"})` — find related execution flows
3. Read key files listed above for implementation details
