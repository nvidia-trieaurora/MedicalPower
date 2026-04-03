---
name: ui
description: "Skill for the Ui area of MedicalPower. 65 symbols across 17 files."
---

# Ui

65 symbols | 17 files | Cohesion: 99%

## When to Use

- Working with code in `apps/`
- Understanding how cn, Logo, ConfirmProvider work
- Modifying ui-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `apps/portal-web/src/components/ui/select.tsx` | SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel (+4) |
| `apps/portal-web/src/components/ui/dropdown-menu.tsx` | DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSubTrigger, DropdownMenuSubContent (+4) |
| `apps/portal-web/src/components/ui/table.tsx` | Table, TableHeader, TableBody, TableFooter, TableRow (+3) |
| `apps/portal-web/src/components/ui/card.tsx` | Card, CardHeader, CardTitle, CardDescription, CardAction (+2) |
| `apps/portal-web/src/components/ui/sheet.tsx` | SheetOverlay, SheetContent, SheetHeader, SheetFooter, SheetTitle (+1) |
| `apps/portal-web/src/components/ui/dialog.tsx` | DialogOverlay, DialogContent, DialogHeader, DialogFooter, DialogTitle (+1) |
| `apps/portal-web/src/components/ui/avatar.tsx` | Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup (+1) |
| `apps/portal-web/src/components/ui/tabs.tsx` | Tabs, TabsList, TabsTrigger, TabsContent |
| `apps/portal-web/src/components/ui/confirm-dialog.tsx` | ConfirmProvider, handleClose |
| `apps/portal-web/src/lib/utils.ts` | cn |

## Entry Points

Start here when exploring this area:

- **`cn`** (Function) — `apps/portal-web/src/lib/utils.ts:3`
- **`Logo`** (Function) — `apps/portal-web/src/components/ui/logo.tsx:14`
- **`ConfirmProvider`** (Function) — `apps/portal-web/src/components/ui/confirm-dialog.tsx:25`
- **`handleClose`** (Function) — `apps/portal-web/src/components/ui/confirm-dialog.tsx:38`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `cn` | Function | `apps/portal-web/src/lib/utils.ts` | 3 |
| `Logo` | Function | `apps/portal-web/src/components/ui/logo.tsx` | 14 |
| `ConfirmProvider` | Function | `apps/portal-web/src/components/ui/confirm-dialog.tsx` | 25 |
| `handleClose` | Function | `apps/portal-web/src/components/ui/confirm-dialog.tsx` | 38 |
| `TooltipContent` | Function | `apps/portal-web/src/components/ui/tooltip.tsx` | 27 |
| `Textarea` | Function | `apps/portal-web/src/components/ui/textarea.tsx` | 4 |
| `Tabs` | Function | `apps/portal-web/src/components/ui/tabs.tsx` | 7 |
| `TabsList` | Function | `apps/portal-web/src/components/ui/tabs.tsx` | 40 |
| `TabsTrigger` | Function | `apps/portal-web/src/components/ui/tabs.tsx` | 55 |
| `TabsContent` | Function | `apps/portal-web/src/components/ui/tabs.tsx` | 71 |
| `Table` | Function | `apps/portal-web/src/components/ui/table.tsx` | 6 |
| `TableHeader` | Function | `apps/portal-web/src/components/ui/table.tsx` | 21 |
| `TableBody` | Function | `apps/portal-web/src/components/ui/table.tsx` | 31 |
| `TableFooter` | Function | `apps/portal-web/src/components/ui/table.tsx` | 41 |
| `TableRow` | Function | `apps/portal-web/src/components/ui/table.tsx` | 54 |
| `TableHead` | Function | `apps/portal-web/src/components/ui/table.tsx` | 67 |
| `TableCell` | Function | `apps/portal-web/src/components/ui/table.tsx` | 80 |
| `TableCaption` | Function | `apps/portal-web/src/components/ui/table.tsx` | 93 |
| `SheetOverlay` | Function | `apps/portal-web/src/components/ui/sheet.tsx` | 25 |
| `SheetContent` | Function | `apps/portal-web/src/components/ui/sheet.tsx` | 38 |

## How to Explore

1. `gitnexus_context({name: "cn"})` — see callers and callees
2. `gitnexus_query({query: "ui"})` — find related execution flows
3. Read key files listed above for implementation details
