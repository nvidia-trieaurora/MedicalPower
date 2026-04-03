---
name: workflow
description: "Skill for the Workflow area of MedicalPower. 4 symbols across 2 files."
---

# Workflow

4 symbols | 2 files | Cohesion: 100%

## When to Use

- Working with code in `apps/`
- Understanding how WorkflowSidebar, onDragStart, NodeConfigPanel work
- Modifying workflow-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `apps/portal-web/src/components/workflow/WorkflowSidebar.tsx` | WorkflowSidebar, onDragStart |
| `apps/portal-web/src/components/workflow/NodeConfigPanel.tsx` | NodeConfigPanel, update |

## Entry Points

Start here when exploring this area:

- **`WorkflowSidebar`** (Function) — `apps/portal-web/src/components/workflow/WorkflowSidebar.tsx:30`
- **`onDragStart`** (Function) — `apps/portal-web/src/components/workflow/WorkflowSidebar.tsx:31`
- **`NodeConfigPanel`** (Function) — `apps/portal-web/src/components/workflow/NodeConfigPanel.tsx:15`
- **`update`** (Function) — `apps/portal-web/src/components/workflow/NodeConfigPanel.tsx:19`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `WorkflowSidebar` | Function | `apps/portal-web/src/components/workflow/WorkflowSidebar.tsx` | 30 |
| `onDragStart` | Function | `apps/portal-web/src/components/workflow/WorkflowSidebar.tsx` | 31 |
| `NodeConfigPanel` | Function | `apps/portal-web/src/components/workflow/NodeConfigPanel.tsx` | 15 |
| `update` | Function | `apps/portal-web/src/components/workflow/NodeConfigPanel.tsx` | 19 |

## How to Explore

1. `gitnexus_context({name: "WorkflowSidebar"})` — see callers and callees
2. `gitnexus_query({query: "workflow"})` — find related execution flows
3. Read key files listed above for implementation details
