---
name: task
description: "Skill for the Task area of MedicalPower. 4 symbols across 2 files."
---

# Task

4 symbols | 2 files | Cohesion: 75%

## When to Use

- Working with code in `apps/`
- Understanding how useSocket, TaskChat, handleSend work
- Modifying task-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `apps/portal-web/src/components/task/TaskChat.tsx` | TaskChat, handleSend, handleInputChange |
| `apps/portal-web/src/lib/socket-context.tsx` | useSocket |

## Entry Points

Start here when exploring this area:

- **`useSocket`** (Function) — `apps/portal-web/src/lib/socket-context.tsx:17`
- **`TaskChat`** (Function) — `apps/portal-web/src/components/task/TaskChat.tsx:24`
- **`handleSend`** (Function) — `apps/portal-web/src/components/task/TaskChat.tsx:70`
- **`handleInputChange`** (Function) — `apps/portal-web/src/components/task/TaskChat.tsx:84`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `useSocket` | Function | `apps/portal-web/src/lib/socket-context.tsx` | 17 |
| `TaskChat` | Function | `apps/portal-web/src/components/task/TaskChat.tsx` | 24 |
| `handleSend` | Function | `apps/portal-web/src/components/task/TaskChat.tsx` | 70 |
| `handleInputChange` | Function | `apps/portal-web/src/components/task/TaskChat.tsx` | 84 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Notifications | 1 calls |
| Admin | 1 calls |

## How to Explore

1. `gitnexus_context({name: "useSocket"})` — see callers and callees
2. `gitnexus_query({query: "task"})` — find related execution flows
3. Read key files listed above for implementation details
