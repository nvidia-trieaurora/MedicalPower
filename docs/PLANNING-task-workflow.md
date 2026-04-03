# Task Workflow Redesign — Planning Document

> Status: In Progress
> Last updated: 2026-04-01

## 1. Tổng quan

Thiết kế lại toàn bộ flow nhiệm vụ (task) trong MedicalPower:
- Trang tạo nhiệm vụ mới với wizard chọn patient → case → task config → workflow
- Kết nối action buttons vào API thật (thay vì demo alert)
- WebSocket real-time cho task updates và notifications
- P2P Chat giữa các bác sĩ trong context của task

## 2. Flow tổng quan

```
Admin tạo Workflow Template → Lưu vào DB → Hiện trong dropdown khi tạo task

Leader/Admin tạo nhiệm vụ:
  Step 1: Chọn bệnh nhân → hiện danh sách ca bệnh
  Step 2: Chọn loại task + workflow template + gán bác sĩ + ưu tiên + SLA
  Step 3: Xác nhận → tạo task trong DB → notification cho người được gán

Quy trình nhiệm vụ:
  created → [assign] → assigned → [start] → in_progress → [submit] → submitted
  → [send_for_review] → in_review → [approve] → approved → [complete] → completed
                                   → [reject] → rejected → [reassign] → in_progress

Real-time:
  WebSocket events: task:updated, task:assigned, chat:message, chat:typing, notification:new
  P2P Chat: comment thread trong mỗi task, real-time qua WebSocket
```

## 3. Trang tạo nhiệm vụ — `/tasks/new`

File: `apps/portal-web/src/app/tasks/new/page.tsx`

### Step Wizard 3 bước:

**Step 1 — Chọn bệnh nhân + ca bệnh:**
- Search bệnh nhân (fuzzy search)
- Khi chọn bệnh nhân → hiện danh sách ca bệnh + studies liên kết
- Chọn ca bệnh

**Step 2 — Cấu hình nhiệm vụ:**
- Chọn loại task: annotate, review, diagnose, report
- Chọn quy trình (workflow template) từ danh sách admin đã tạo sẵn
- Gán cho bác sĩ nào (search user với role phù hợp)
- Ưu tiên: critical, high, normal, low
- Hạn SLA (optional)

**Step 3 — Xác nhận và tạo:**
- Tổng hợp thông tin → bấm "Tạo nhiệm vụ"
- Gọi API tạo task
- Tạo notification cho người được gán

## 4. Action Buttons hoạt động thật

File: `apps/portal-web/src/app/tasks/page.tsx`

Thay tất cả `alert()` bằng `taskApi.transition()`:

| Nút | API Call | Trạng thái |
|---|---|---|
| Bắt đầu | `transition(id, 'start')` | assigned → in_progress |
| Gửi duyệt | `transition(id, 'submit')` | in_progress → submitted |
| Gửi review | `transition(id, 'send_for_review')` | submitted → in_review |
| Duyệt | `transition(id, 'approve')` | in_review → approved |
| Từ chối | `transition(id, 'reject')` | in_review → rejected |
| Hoàn thành | `transition(id, 'complete')` | approved → completed |

Sau mỗi transition: refresh task list + toast thông báo

## 5. WebSocket Real-time Gateway

### Backend
Files:
- `services/workflow-service/src/realtime/realtime.gateway.ts`
- `services/workflow-service/src/realtime/realtime.module.ts`

Sử dụng `@nestjs/websockets` + `socket.io`:
- Namespace: `/ws`
- Events:
  - `task:updated` — khi task thay đổi trạng thái
  - `task:assigned` — khi task được gán cho user
  - `chat:message` — khi có tin nhắn mới trong task
  - `chat:typing` — khi user đang gõ
  - `notification:new` — khi có notification mới

### Frontend
File: `apps/portal-web/src/lib/socket-context.tsx`

- Connect tới `ws://localhost:4006/ws` khi user đăng nhập
- Auto-reconnect khi mất kết nối
- Export `useSocket()` hook
- Tasks page: listen `task:updated` → refresh list
- Notification bell: listen `notification:new` → update count + show toast

## 6. P2P Chat trong Task

### Database Schema
File: `packages/database/prisma/schema/12_chat.prisma`

```prisma
model TaskComment {
  id        String   @id @default(uuid())
  taskId    String   @map("task_id")
  userId    String   @map("user_id")
  message   String
  type      String   @default("text") // text, status_change, file
  metadata  Json?
  createdAt DateTime @default(now()) @map("created_at")

  task Task @relation(fields: [taskId], references: [id])
  user User @relation("TaskComments", fields: [userId], references: [id])

  @@index([taskId, createdAt])
  @@map("task_comments")
}
```

### Backend API
Files: `services/workflow-service/src/chat/` module

- `GET /api/v1/tasks/:taskId/comments` — lấy comments (pagination)
- `POST /api/v1/tasks/:taskId/comments` — gửi comment → emit WebSocket `chat:message`

### Frontend
Files:
- `apps/portal-web/src/components/task/TaskChat.tsx` — chat panel component
- `apps/portal-web/src/app/tasks/[id]/page.tsx` — task detail page với chat

Chat panel features:
- Danh sách comments (avatar + tên + thời gian + nội dung)
- Input gõ tin nhắn + nút gửi
- Typing indicator (WebSocket `chat:typing`)
- Auto-scroll xuống khi có tin mới
- System messages khi task thay đổi trạng thái

## 7. Workflow Template Sync

Workflow templates admin tạo qua `/workflows/builder` đã có save API.
Khi tạo task, frontend gọi `GET /api/v1/workflow-templates` để lấy danh sách templates → dropdown chọn.

## 8. Dependencies cần cài

### Backend (workflow-service)
- `@nestjs/websockets` — WebSocket gateway
- `@nestjs/platform-socket.io` — Socket.IO adapter
- `socket.io` — WebSocket server

### Frontend (portal-web)
- `socket.io-client` — WebSocket client

## 9. Thứ tự triển khai

1. Task creation page (`/tasks/new`)
2. Action buttons kết nối API thật
3. WebSocket gateway backend
4. WebSocket frontend provider
5. Chat schema + API
6. Chat UI + task detail page
7. i18n, CHANGELOG, testing
