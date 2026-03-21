# Getting Started — MedicalPower

Step-by-step guide to set up and run MedicalPower locally.

## Prerequisites

| Software | Version | Check |
|----------|---------|-------|
| **Node.js** | >= 20.9.0 | `node -v` |
| **npm** | >= 10.0.0 | `npm -v` |
| **Docker Desktop** | >= 4.0 | `docker -v` |
| **Docker Compose** | >= 2.0 | `docker compose version` |
| **Git** | >= 2.0 | `git -v` |
| **Yarn** (for OHIF) | >= 1.22 | `yarn -v` |
| NVIDIA GPU + CUDA (optional) | CUDA 11.3+ | `nvidia-smi` |

> GPU is only required for MONAI Label (AI inference). Portal and backend development works without GPU.

## Step 1: Clone the repository

```bash
git clone --recurse-submodules https://github.com/nvidia-trieaurora/MedicalPower.git
cd MedicalPower
```

If you already cloned without submodules:

```bash
git submodule update --init --recursive
```

Verify:
```bash
ls vendor/ohif-viewers/package.json    # must exist
ls vendor/monai-label/setup.py         # must exist
```

## Step 2: Start Infrastructure (Docker)

```bash
cd infra/docker
cp .env.example .env    # create env file (first time only)
docker compose -f docker-compose.dev.yml up -d
```

Wait ~30-60 seconds for services to start. Check:

```bash
docker compose -f docker-compose.dev.yml ps
```

Expected result:

| Service | Port | Status |
|---------|------|--------|
| PostgreSQL | 5432 | healthy |
| Redis | 6379 | healthy |
| Orthanc | 8042 | healthy |

Verify access:
- Orthanc Admin: http://localhost:8042/ui/app/ (admin / mp_admin_2026)

## Step 3: Set up Database

```bash
cd ../../packages/database
npm install
npx prisma migrate deploy --schema=prisma/schema
npx tsx prisma/seed.ts
```

Expected output:
```
✓ Organization: Bệnh viện Thống Nhất
✓ Patients: 5 patients created
✓ Studies: 3 studies created
✓ Cases: 3 cases created
✓ Tasks: 4 tasks created
✅ Seed complete!
```

Verify database (optional):
- Use VS Code Database Client or pgAdmin
- Host: `127.0.0.1`, Port: `5432`, User: `mp_admin`, Password: `mp_secret_dev`, Database: `medicalpower`

## Step 4: Upload Sample DICOM Data

If you have a DICOM folder (e.g., patient CT scans):

```bash
cd ../../
./scripts/upload-dicom.sh /path/to/dicom/folder
```

Verify: open http://localhost:8042/ui/app/ → you should see the patient and study.

## Step 5: Run Backend API

```bash
cd services/patient-service
npm install
npx prisma generate --schema=../../packages/database/prisma/schema
npx nest build
node dist/main.js
```

Output:
```
patient-service running on http://localhost:4002
Swagger docs: http://localhost:4002/docs
```

Verify: open http://localhost:4002/api/v1/patients → returns JSON patient list.

## Step 6: Run Portal Web

Open a new terminal:

```bash
cd apps/portal-web
npm install     # first time only
npm run dev
```

Access: http://localhost:3000

You will see:
- Dashboard with statistics
- Patient list (real data from database if patient-service is running)
- Case list
- Task queue
- VI/EN language toggle in header

## Step 7: Run OHIF Viewer (optional)

Open a new terminal:

```bash
./scripts/start-ohif-dev.sh
```

> First run installs dependencies (~5-10 minutes). Subsequent runs are faster.

Access: http://localhost:3001

View sample CT scan:
```
http://localhost:3001/viewer?StudyInstanceUIDs=1.2.840.113704.1.111.13428.1678778829.1
```

## Port Summary

| Service | URL | Purpose |
|---------|-----|---------|
| Portal Web | http://localhost:3000 | Management UI |
| OHIF Viewer | http://localhost:3001 | Medical image viewer |
| Patient API | http://localhost:4002 | Backend API |
| Swagger Docs | http://localhost:4002/docs | API documentation |
| Orthanc Admin | http://localhost:8042/ui/app/ | DICOM management (admin) |
| PostgreSQL | localhost:5432 | Database |

## Shutting Down

```bash
# Stop Docker infrastructure
cd infra/docker
docker compose -f docker-compose.dev.yml down

# Stop and remove all data (WARNING: deletes everything)
docker compose -f docker-compose.dev.yml down -v
```

## Troubleshooting

### Orthanc shows "unhealthy"
Orthanc may take a few minutes to start. Check logs:
```bash
docker compose -f docker-compose.dev.yml logs orthanc --tail=20
```

### Patient API returns database connection error
Ensure PostgreSQL is running and migrations have been applied:
```bash
docker compose -f docker-compose.dev.yml ps postgres
cd packages/database && npx prisma migrate deploy --schema=prisma/schema
```

### Portal shows "API not ready"
patient-service is not running. The portal automatically falls back to sample data. Run Step 5 to fix.

### OHIF Viewer doesn't load images
Verify Orthanc is running and has data:
```bash
curl -u admin:mp_admin_2026 http://localhost:8042/patients
```

## Next Steps

- Read [PLANNING.md](../PLANNING.md) for the full architecture overview
- Read [CLAUDE.md](../../CLAUDE.md) for coding conventions and rules
- Read [infrastructure.md](infrastructure.md) for detailed service documentation
