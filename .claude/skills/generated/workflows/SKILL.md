---
name: workflows
description: "Skill for the Workflows area of MedicalPower. 4 symbols across 2 files."
---

# Workflows

4 symbols | 2 files | Cohesion: 50%

## When to Use

- Working with code in `apps/`
- Understanding how useConfirm, WorkflowsPage, handleDuplicate work
- Modifying workflows-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `apps/portal-web/src/app/workflows/page.tsx` | WorkflowsPage, handleDuplicate, handleDelete |
| `apps/portal-web/src/components/ui/confirm-dialog.tsx` | useConfirm |

## Entry Points

Start here when exploring this area:

- **`useConfirm`** (Function) — `apps/portal-web/src/components/ui/confirm-dialog.tsx:23`
- **`WorkflowsPage`** (Function) — `apps/portal-web/src/app/workflows/page.tsx:19`
- **`handleDuplicate`** (Function) — `apps/portal-web/src/app/workflows/page.tsx:25`
- **`handleDelete`** (Function) — `apps/portal-web/src/app/workflows/page.tsx:37`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `useConfirm` | Function | `apps/portal-web/src/components/ui/confirm-dialog.tsx` | 23 |
| `WorkflowsPage` | Function | `apps/portal-web/src/app/workflows/page.tsx` | 19 |
| `handleDuplicate` | Function | `apps/portal-web/src/app/workflows/page.tsx` | 25 |
| `handleDelete` | Function | `apps/portal-web/src/app/workflows/page.tsx` | 37 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `WorkflowsPage → T` | cross_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Admin | 3 calls |

## How to Explore

1. `gitnexus_context({name: "useConfirm"})` — see callers and callees
2. `gitnexus_query({query: "workflows"})` — find related execution flows
3. Read key files listed above for implementation details
