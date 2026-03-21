# Hướng dẫn Bắt đầu — MedicalPower

Hướng dẫn từng bước để thiết lập và chạy MedicalPower trên máy local.

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

> Lần đầu chạy sẽ cài dependencies (~5-10 phút). Các lần sau nhanh hơn.

Truy cập: http://localhost:3001

Xem ảnh CT BUI TRONG TINH:
```
http://localhost:3001/viewer?StudyInstanceUIDs=1.2.840.113704.1.111.13428.1678778829.1
```

## Tóm tắt các cổng

| Service | URL | Mục đích |
|---------|-----|---------|
| Portal Web | http://localhost:3000 | Giao diện quản lý |
| OHIF Viewer | http://localhost:3001 | Xem ảnh y khoa |
| Patient API | http://localhost:4002 | Backend API |
| Swagger Docs | http://localhost:4002/docs | API documentation |
| Orthanc Admin | http://localhost:8042/ui/app/ | Quản lý DICOM (admin) |
| PostgreSQL | localhost:5432 | Database |

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

## Bước tiếp theo

- Đọc [PLANNING.md](../PLANNING.md) để hiểu kiến trúc tổng thể
- Đọc [CLAUDE.md](../../CLAUDE.md) để hiểu quy tắc code
- Đọc [infrastructure.md](infrastructure.md) để hiểu chi tiết các services
