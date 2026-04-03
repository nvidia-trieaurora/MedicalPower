---
name: engine
description: "Skill for the Engine area of MedicalPower. 8 symbols across 2 files."
---

# Engine

8 symbols | 2 files | Cohesion: 100%

## When to Use

- Working with code in `services/`
- Understanding how updateState, complete, startWorkflow work
- Modifying engine-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `services/workflow-service/src/engine/workflow-engine.service.ts` | startWorkflow, onTaskCompleted, advanceFromNode, createTaskForNode, evaluateCondition (+1) |
| `services/workflow-service/src/workflow-run/workflow-run.service.ts` | updateState, complete |

## Entry Points

Start here when exploring this area:

- **`updateState`** (Method) — `services/workflow-service/src/workflow-run/workflow-run.service.ts:40`
- **`complete`** (Method) — `services/workflow-service/src/workflow-run/workflow-run.service.ts:50`
- **`startWorkflow`** (Method) — `services/workflow-service/src/engine/workflow-engine.service.ts:36`
- **`onTaskCompleted`** (Method) — `services/workflow-service/src/engine/workflow-engine.service.ts:53`
- **`advanceFromNode`** (Method) — `services/workflow-service/src/engine/workflow-engine.service.ts:61`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `updateState` | Method | `services/workflow-service/src/workflow-run/workflow-run.service.ts` | 40 |
| `complete` | Method | `services/workflow-service/src/workflow-run/workflow-run.service.ts` | 50 |
| `startWorkflow` | Method | `services/workflow-service/src/engine/workflow-engine.service.ts` | 36 |
| `onTaskCompleted` | Method | `services/workflow-service/src/engine/workflow-engine.service.ts` | 53 |
| `advanceFromNode` | Method | `services/workflow-service/src/engine/workflow-engine.service.ts` | 61 |
| `createTaskForNode` | Method | `services/workflow-service/src/engine/workflow-engine.service.ts` | 95 |
| `evaluateCondition` | Method | `services/workflow-service/src/engine/workflow-engine.service.ts` | 111 |
| `handleParallel` | Method | `services/workflow-service/src/engine/workflow-engine.service.ts` | 142 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `OnTaskCompleted → UpdateState` | intra_community | 4 |
| `StartWorkflow → UpdateState` | intra_community | 4 |
| `EvaluateCondition → UpdateState` | intra_community | 4 |
| `OnTaskCompleted → CreateTaskForNode` | intra_community | 3 |
| `OnTaskCompleted → EvaluateCondition` | intra_community | 3 |
| `StartWorkflow → CreateTaskForNode` | intra_community | 3 |
| `StartWorkflow → EvaluateCondition` | intra_community | 3 |
| `EvaluateCondition → CreateTaskForNode` | intra_community | 3 |

## How to Explore

1. `gitnexus_context({name: "updateState"})` — see callers and callees
2. `gitnexus_query({query: "engine"})` — find related execution flows
3. Read key files listed above for implementation details
