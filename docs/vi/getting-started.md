# Hướng dẫn Bắt đầu — MedicalPower

Hướng dẫn từng bước để thiết lập và chạy MedicalPower trên máy local.

## Khởi động nhanh (1 lệnh)

Nếu đã cài đầy đủ prerequisites và Docker đang chạy:

```bash
git clone --recurse-submodules https://github.com/nvidia-trieaurora/MedicalPower.git
cd MedicalPower
./scripts/dev.sh
```

Script này tự động: khởi động Docker → chờ database ready → chạy migration → start backend API → start portal web.

Kết quả:
- Portal Web: http://localhost:3000
- Patient API: http://localhost:4002/api/v1/patients
- Orthanc Admin: http://localhost:8042/ui/app/

Nhấn `Ctrl+C` để dừng Portal + API. Docker infrastructure vẫn chạy nền.

---

Nếu muốn hiểu chi tiết từng bước, đọc tiếp bên dưới.

## Yêu cầu hệ thống

| Phần mềm | Phiên bản | Kiểm tra |
|-----------|-----------|----------|
| **Node.js** | >= 20.9.0 | `node -v` |
| **npm** | >= 10.0.0 | `npm -v` |
| **Docker Desktop** | >= 4.0 | `docker -v` |
| **Docker Compose** | >= 2.0 | `docker compose version` |
| **Git** | >= 2.0 | `git -v` |
| **Yarn** (cho OHIF) | >= 1.22 | `yarn -v` |
| NVIDIA GPU + CUDA (tùy chọn) | CUDA 11.3+ | `nvidia-smi` |

> GPU chỉ cần khi chạy MONAI Label (AI inference). Có thể phát triển portal/backend mà không cần GPU.

## Bước 1: Clone repository

```bash
git clone --recurse-submodules https://github.com/nvidia-trieaurora/MedicalPower.git
cd MedicalPower
```

Nếu đã clone mà chưa có submodules:

```bash
git submodule update --init --recursive
```

Kiểm tra:
```bash
ls vendor/ohif-viewers/package.json    # phải tồn tại
ls vendor/monai-label/setup.py         # phải tồn tại
```

## Bước 2: Khởi động Infrastructure (Docker)

```bash
cd infra/docker
cp .env.example .env    # tạo file env (chỉ lần đầu)
docker compose -f docker-compose.dev.yml up -d
```

Chờ khoảng 30-60 giây cho services khởi động. Kiểm tra:

```bash
docker compose -f docker-compose.dev.yml ps
```

Kết quả mong đợi:

| Service | Port | Trạng thái |
|---------|------|-----------|
| PostgreSQL | 5432 | healthy |
| Redis | 6379 | healthy |
| Orthanc | 8042 | healthy |

Truy cập kiểm tra:
- Orthanc Admin: http://localhost:8042/ui/app/ (admin / mp_admin_2026)

## Bước 3: Thiết lập Database

```bash
cd ../../packages/database
npm install
npx prisma migrate deploy --schema=prisma/schema
npx tsx prisma/seed.ts
```

Kết quả mong đợi:
```
✓ Organization: Bệnh viện Thống Nhất
✓ Patients: 5 patients created
✓ Studies: 3 studies created
✓ Cases: 3 cases created
✓ Tasks: 4 tasks created
✅ Seed complete!
```

Kiểm tra database (tùy chọn):
- Dùng VS Code Database Client hoặc pgAdmin
- Host: `127.0.0.1`, Port: `5432`, User: `mp_admin`, Password: `mp_secret_dev`, Database: `medicalpower`

## Bước 4: Upload dữ liệu DICOM mẫu

Nếu có thư mục DICOM (ví dụ: BUI TRONG TINH):

```bash
cd ../../
./scripts/upload-dicom.sh /đường-dẫn/tới/thư-mục-dicom
```

Kiểm tra: mở http://localhost:8042/ui/app/ → thấy bệnh nhân và study.

## Bước 5: Chạy Backend API

```bash
cd services/patient-service
npm install
npx prisma generate --schema=../../packages/database/prisma/schema
npx nest build
node dist/main.js
```

Kết quả:
```
patient-service running on http://localhost:4002
Swagger docs: http://localhost:4002/docs
```

Kiểm tra: mở http://localhost:4002/api/v1/patients → trả về danh sách bệnh nhân JSON.

## Bước 6: Chạy Portal Web

Mở terminal mới:

```bash
cd apps/portal-web
npm install     # chỉ lần đầu
npm run dev
```

Truy cập: http://localhost:3000

Bạn sẽ thấy:
- Dashboard với thống kê
- Danh sách bệnh nhân (từ database thật nếu patient-service đang chạy)
- Danh sách ca bệnh
- Hàng đợi nhiệm vụ
- Nút chuyển ngữ VI/EN trên header

## Bước 7: Chạy OHIF Viewer (tùy chọn)

Mở terminal mới:

```bash
./scripts/start-ohif-dev.sh
```

> Lần đầu chạy sẽ copy MONAI Label extension vào OHIF và cài dependencies (~5-10 phút). Các lần sau nhanh hơn.

Truy cập: http://localhost:3001

Xem ảnh CT BUI TRONG TINH:
```
http://localhost:3001/viewer?StudyInstanceUIDs=1.2.840.113704.1.111.13428.1678778829.1
```

Script tự động:
- Copy MONAI Label OHIF extension và mode vào viewer
- Copy config MedicalPower (pluginConfig.json + local_orthanc.js)
- Kiểm tra kết nối Orthanc và MONAI Label
- Chạy webpack dev server với Orthanc proxy

## Bước 8: MONAI Label — AI Segmentation (cần GPU)

MONAI Label chạy trên GPU instance từ xa qua [Brev](https://brev.dev). KHÔNG cần GPU cục bộ.

### 8a. Cài Brev CLI

```bash
brew install brevdev/homebrew-brev/brev
brev login
```

### 8b. Truy cập GPU instance

GPU instance `medicalpower-monai` đã được cấu hình sẵn:

| Thuộc tính | Giá trị |
|-----------|---------|
| Instance ID | `u34zano2u` |
| Máy | NVIDIA RTX A6000 (48GB VRAM) |
| IP | 185.216.20.81 |
| Chi phí | ~$0.60/giờ |

```bash
# SSH vào instance
brev shell medicalpower-monai

# Kiểm tra GPU
nvidia-smi
```

### 8c. Reverse tunnel Orthanc lên GPU instance

MONAI Label cần đọc DICOM từ Orthanc (chạy trên máy local). Mở **terminal mới trên máy local**:

```bash
ssh -R 8042:localhost:8042 -N shadeform@185.216.20.81
```

Giữ terminal này mở (treo im = đang hoạt động). Lệnh này cho phép MONAI Label server trên Brev gọi tới Orthanc qua `localhost:8042`.

### 8d. Start MONAI Label server

SSH vào instance:

```bash
brev shell medicalpower-monai
```

Trong instance, chạy:

```bash
python3 -m monailabel.main start_server \
  --app ~/.local/monailabel/sample-apps/radiology \
  --studies http://localhost:8042/dicom-web \
  --conf models all \
  --port 8000 \
  --host 0.0.0.0
```

> `--studies http://localhost:8042/dicom-web` kết nối tới Orthanc qua reverse tunnel.
> `--conf models all` load tất cả models. Lần đầu download weights (~5 phút), các lần sau dùng cache.

Chờ đến khi thấy `Uvicorn running on http://0.0.0.0:8000` là thành công.

**Chạy nền (không cần giữ SSH):** Dùng tmux để server sống sót khi tắt SSH:

```bash
tmux new -s monai
python3 -m monailabel.main start_server \
  --app ~/.local/monailabel/sample-apps/radiology \
  --studies http://localhost:8042/dicom-web \
  --conf models all \
  --port 8000 \
  --host 0.0.0.0
# Nhấn Ctrl+B rồi D để detach (server vẫn chạy)
# Lần sau quay lại: tmux attach -t monai
```

### 8e. Port-forward MONAI Label về localhost

Mở **terminal mới trên máy local**:

```bash
brev port-forward medicalpower-monai -p 8000:8000
```

Giữ terminal này mở. MONAI Label truy cập được tại http://localhost:8000.

Kiểm tra:

```bash
curl http://localhost:8000/info/ | python3 -m json.tool | head -5
```

### 8f. Các AI Model có sẵn

Dùng `--conf models all` sẽ load tất cả models sau:

| Model | Loại | Mô tả |
|-------|------|-------|
| `segmentation` | Auto Segmentation | SegResNet — 25 cơ quan (lách, gan, thận, phổi...) |
| `deepgrow_2d` | Point Prompts (2D) | Click trên 1 slice để segment |
| `deepgrow_3d` | Point Prompts (3D) | Click để segment 3D volume |
| `deepedit` | Interactive Edit | Vẽ điểm + AI cải thiện iterative |
| `segmentation_spleen` | Spleen | Segment lách chuyên biệt |
| `segmentation_vertebra` | Vertebra | Segment đốt sống |
| `localization_spine` | Spine | Định vị cột sống |
| `localization_vertebra` | Vertebra | Định vị đốt sống |
| `sam_2d` | SAM 2D | SAM2 Hiera Large — click-to-segment |
| `sam_3d` | SAM 3D | SAM2 Hiera Large — 3D volume |
| `Histogram+GraphCut` | Scribbles | Vẽ scribble → segment |
| `GMM+GraphCut` | Scribbles | GMM-based scribble |

Nếu chỉ cần một số models (tiết kiệm RAM), dùng:

```bash
--conf models segmentation,deepgrow_2d,deepgrow_3d
```

### 8g. Sử dụng MONAI Label trong OHIF Viewer

Mở OHIF ở chế độ MONAI Label:

```
http://localhost:3001/monai-label?StudyInstanceUIDs=1.2.840.113704.1.111.13428.1678778829.1
```

Trong panel **MONAI Label** (bên phải):
1. Nhập server URL: `http://localhost:8000` → bấm **Connect**
2. Mở **Auto-Segmentation** → chọn model (vd: `segmentation`)
3. Bấm **Run** → chờ ~10-15 giây → segmentation overlay xuất hiện trên ảnh CT
4. Chỉnh sửa bằng Brush/Eraser tools (toolbar trên)
5. Bấm **Save Label** để lưu kết quả về MONAI Label server

### 8h. Tổng kết: cần mở bao nhiêu terminal

| Terminal | Lệnh | Mục đích |
|----------|-------|----------|
| 1 | `./scripts/dev.sh` | Portal + API + OHIF + Docker |
| 2 | `ssh -R 8042:localhost:8042 -N shadeform@185.216.20.81` | Reverse tunnel Orthanc → Brev |
| 3 | `brev port-forward medicalpower-monai -p 8000:8000` | Forward MONAI Label → local |

Terminal SSH vào instance chỉ cần lần đầu (hoặc khi restart server). Nếu dùng tmux thì tắt SSH không ảnh hưởng.

### 8i. Kiểm tra & debug

```bash
# Kiểm tra MONAI Label đang chạy trong instance
brev exec medicalpower-monai "curl -s http://localhost:8000/info/" 2>&1 | head -5

# Kiểm tra process
brev exec medicalpower-monai "ps aux | grep monailabel"

# Kiểm tra GPU
brev exec medicalpower-monai "nvidia-smi"
```

### 8j. Quản lý GPU instance

```bash
# Tắt instance (tiết kiệm chi phí)
brev stop medicalpower-monai

# Bật lại instance
brev start medicalpower-monai

# Mở VS Code trên instance
brev open medicalpower-monai cursor
```

> **Lưu ý chi phí:** Instance tốn ~$0.60/giờ. Tắt khi không sử dụng.

## Tóm tắt các cổng

| Service | URL | Mục đích |
|---------|-----|---------|
| Portal Web | http://localhost:3000 | Giao diện quản lý |
| OHIF Viewer | http://localhost:3001 | Xem ảnh y khoa |
| Patient API | http://localhost:4002 | Backend API |
| Swagger Docs | http://localhost:4002/docs | API documentation |
| MONAI Label | http://localhost:8000 | AI inference (qua Brev port-forward) |
| MONAI Label Docs | http://localhost:8000/docs | MONAI Label API docs |
| Orthanc Admin | http://localhost:8042/ui/app/ | Quản lý DICOM (admin) |
| PostgreSQL | localhost:5432 | Database |
| Redis | localhost:6379 | Cache / session |

## Tắt hệ thống

```bash
# Tắt Docker infrastructure
cd infra/docker
docker compose -f docker-compose.dev.yml down

# Tắt và xóa toàn bộ dữ liệu (CẢNH BÁO: mất hết data)
docker compose -f docker-compose.dev.yml down -v
```

## Xử lý sự cố

### Orthanc hiện "unhealthy"
Orthanc có thể mất vài phút để khởi động. Kiểm tra logs:
```bash
docker compose -f docker-compose.dev.yml logs orthanc --tail=20
```

### Patient API trả lỗi kết nối database
Đảm bảo PostgreSQL đang chạy và đã chạy migration:
```bash
docker compose -f docker-compose.dev.yml ps postgres
cd packages/database && npx prisma migrate deploy --schema=prisma/schema
```

### Portal hiện "API chưa sẵn sàng"
patient-service chưa chạy. Portal sẽ tự động fallback sang dữ liệu mẫu. Chạy bước 5 để khắc phục.

### OHIF Viewer không load ảnh
Kiểm tra Orthanc đang chạy và có dữ liệu:
```bash
curl -u admin:mp_admin_2026 http://localhost:8042/patients
```

### MONAI Label không kết nối được (localhost:8000)
Kiểm tra từng bước:
```bash
# 1. Instance có đang chạy không?
brev ls

# 2. MONAI Label có đang chạy trong instance không?
brev exec medicalpower-monai "curl -s http://localhost:8000/info/" 2>&1 | head -5

# 3. Port-forward có đang chạy không?
lsof -i :8000
```

Nếu instance bị tắt → `brev start medicalpower-monai`, chờ ~2 phút, rồi port-forward lại.
Nếu MONAI Label không chạy → xem mục **8g** để start lại.
Nếu port-forward bị đứt → chạy lại `brev port-forward medicalpower-monai -p 8000:8000`.

### OHIF MONAI Label panel báo "Failed to connect"
- Kiểm tra URL trong panel Settings phải là `http://localhost:8000` (không có `/` cuối)
- Kiểm tra port-forward đang chạy: `curl http://localhost:8000/info/`
- Thử refresh trang OHIF rồi bấm Connect lại

## Đăng nhập & Admin Dashboard

### Đăng nhập

Truy cập http://localhost:3000/login để đăng nhập. Tài khoản dev:

| Email | Mật khẩu | Vai trò | Quyền Admin |
|-------|----------|---------|-------------|
| `admin@medicalpower.dev` | `admin123` | System Admin | Full access |
| `lead@medicalpower.dev` | `lead123` | Clinical Lead | Portal only |
| `annotator@medicalpower.dev` | `anno123` | Annotator | Portal only |
| `radiologist@medicalpower.dev` | `radio123` | Radiologist | Portal only |

Sau khi đăng nhập:
- Sidebar hiển thị tên và vai trò người dùng
- Nút "Đăng xuất" ở cuối sidebar
- Trang login có nút quick-login cho dev

### Admin Dashboard (chỉ Admin)

Đăng nhập với tài khoản `admin@medicalpower.dev` để truy cập:

- `/admin` — Tổng quan hệ thống (stats, hoạt động gần đây, trạng thái dịch vụ)
- `/admin/users` — Quản lý người dùng (tìm kiếm, lọc, block/unblock, xóa)
- `/admin/system` — Giám sát hệ thống:
  - Tab **Dịch vụ**: Health check tự động 10 services mỗi 15 giây
  - Tab **Logs**: Xem log hệ thống theo service (Docker, API, OHIF, MONAI)

## Bước tiếp theo

- Đọc [PLANNING.md](../PLANNING.md) để hiểu kiến trúc tổng thể
- Đọc [CLAUDE.md](../../CLAUDE.md) để hiểu quy tắc code
- Đọc [infrastructure.md](infrastructure.md) để hiểu chi tiết các services
