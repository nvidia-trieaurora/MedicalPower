# Getting Started — MedicalPower

Step-by-step guide to set up and run MedicalPower locally.

## Quick Start (1 command)

If you have all prerequisites installed and Docker is running:

```bash
git clone --recurse-submodules https://github.com/nvidia-trieaurora/MedicalPower.git
cd MedicalPower
./scripts/dev.sh
```

This script automatically: starts Docker → waits for database → runs migrations → starts backend API → starts portal web.

Result:
- Portal Web: http://localhost:3000
- Patient API: http://localhost:4002/api/v1/patients
- Orthanc Admin: http://localhost:8042/ui/app/

Press `Ctrl+C` to stop Portal + API. Docker infrastructure keeps running in background.

---

For detailed step-by-step instructions, read on below.

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

> First run copies MONAI Label extension into OHIF and installs dependencies (~5-10 minutes). Subsequent runs are faster.

Access: http://localhost:3001

View sample CT scan:
```
http://localhost:3001/viewer?StudyInstanceUIDs=1.2.840.113704.1.111.13428.1678778829.1
```

The script automatically:
- Copies MONAI Label OHIF extension and mode into the viewer
- Copies MedicalPower config (pluginConfig.json + local_orthanc.js)
- Checks Orthanc and MONAI Label connectivity
- Starts webpack dev server with Orthanc proxy

## Step 8: MONAI Label — AI Segmentation (requires GPU)

MONAI Label runs on a remote GPU instance via [Brev](https://brev.dev). You do NOT need a local GPU.

### 8a. Install Brev CLI

```bash
brew install brevdev/homebrew-brev/brev
brev login
```

### 8b. Access the GPU instance

The GPU instance `medicalpower-monai` is already provisioned:

| Property | Value |
|----------|-------|
| Instance ID | `u34zano2u` |
| Machine | NVIDIA RTX A6000 (48GB VRAM) |
| IP | 185.216.20.81 |
| Cost | ~$0.60/hr |

```bash
# SSH into the instance
brev shell medicalpower-monai

# Check GPU
nvidia-smi
```

### 8c. Reverse tunnel Orthanc to GPU instance

MONAI Label needs to read DICOM from Orthanc (running on your local machine). Open a **new local terminal**:

```bash
ssh -R 8042:localhost:8042 -N shadeform@185.216.20.81
```

Keep this terminal open (hanging = active). This allows MONAI Label server on Brev to reach Orthanc via `localhost:8042`.

### 8d. Start MONAI Label server

SSH into the instance:

```bash
brev shell medicalpower-monai
```

Inside the instance, run:

```bash
python3 -m monailabel.main start_server \
  --app ~/.local/monailabel/sample-apps/radiology \
  --studies http://localhost:8042/dicom-web \
  --conf models all \
  --port 8000 \
  --host 0.0.0.0
```

> `--studies http://localhost:8042/dicom-web` connects to Orthanc via the reverse tunnel.
> `--conf models all` loads all models. First run downloads weights (~5 min), subsequent runs use cache.

Wait until you see `Uvicorn running on http://0.0.0.0:8000`.

**Run in background (persist through SSH disconnect):** Use tmux:

```bash
tmux new -s monai
python3 -m monailabel.main start_server \
  --app ~/.local/monailabel/sample-apps/radiology \
  --studies http://localhost:8042/dicom-web \
  --conf models all \
  --port 8000 \
  --host 0.0.0.0
# Press Ctrl+B then D to detach (server keeps running)
# Reconnect later: tmux attach -t monai
```

### 8e. Port-forward MONAI Label to localhost

Open a **new local terminal**:

```bash
brev port-forward medicalpower-monai -p 8000:8000
```

Keep this terminal open. MONAI Label is now accessible at http://localhost:8000.

Verify:

```bash
curl http://localhost:8000/info/ | python3 -m json.tool | head -5
```

### 8f. Available AI Models

Using `--conf models all` loads all available models:

| Model | Type | Description |
|-------|------|-------------|
| `segmentation` | Auto Segmentation | SegResNet — 25 organs (spleen, liver, kidney, lung, etc.) |
| `deepgrow_2d` | Point Prompts (2D) | Click on a slice to segment |
| `deepgrow_3d` | Point Prompts (3D) | Click to segment 3D volume |
| `deepedit` | Interactive Edit | Draw points + AI iteratively improves |
| `segmentation_spleen` | Spleen | Spleen-specific segmentation |
| `segmentation_vertebra` | Vertebra | Vertebra segmentation |
| `localization_spine` | Spine | Spine localization |
| `localization_vertebra` | Vertebra | Vertebra localization |
| `sam_2d` | SAM 2D | SAM2 Hiera Large — click-to-segment |
| `sam_3d` | SAM 3D | SAM2 Hiera Large — 3D volume |
| `Histogram+GraphCut` | Scribbles | Draw scribble → segment |
| `GMM+GraphCut` | Scribbles | GMM-based scribble segmentation |

To load only specific models (save RAM):

```bash
--conf models segmentation,deepgrow_2d,deepgrow_3d
```

### 8g. Use MONAI Label in OHIF Viewer

Open OHIF in MONAI Label mode:

```
http://localhost:3001/monai-label?StudyInstanceUIDs=1.2.840.113704.1.111.13428.1678778829.1
```

In the **MONAI Label** panel (right side):
1. Enter server URL: `http://localhost:8000` → click **Connect**
2. Open **Auto-Segmentation** → select model (e.g., `segmentation`)
3. Click **Run** → wait ~10-15 seconds → segmentation overlay appears on CT
4. Edit with Brush/Eraser tools (top toolbar)
5. Click **Save Label** to save results to MONAI Label server

### 8h. Summary: how many terminals do you need

| Terminal | Command | Purpose |
|----------|---------|---------|
| 1 | `./scripts/dev.sh` | Portal + API + OHIF + Docker |
| 2 | `ssh -R 8042:localhost:8042 -N shadeform@185.216.20.81` | Reverse tunnel Orthanc → Brev |
| 3 | `brev port-forward medicalpower-monai -p 8000:8000` | Forward MONAI Label → local |

SSH into the instance is only needed the first time (or when restarting server). Using tmux means the server survives SSH disconnects.

### 8i. Debug & monitoring

```bash
# Check if MONAI Label is running inside instance
brev exec medicalpower-monai "curl -s http://localhost:8000/info/" 2>&1 | head -5

# Check process
brev exec medicalpower-monai "ps aux | grep monailabel"

# Check GPU
brev exec medicalpower-monai "nvidia-smi"
```

### 8j. Manage the GPU instance

```bash
# Stop instance (to save cost)
brev stop medicalpower-monai

# Start instance again
brev start medicalpower-monai

# Open VS Code on the instance
brev open medicalpower-monai cursor
```

> **Cost note:** The instance costs ~$0.60/hr. Stop it when not in use.

## Port Summary

| Service | URL | Purpose |
|---------|-----|---------|
| Portal Web | http://localhost:3000 | Management UI |
| OHIF Viewer | http://localhost:3001 | Medical image viewer |
| Patient API | http://localhost:4002 | Backend API |
| Swagger Docs | http://localhost:4002/docs | API documentation |
| MONAI Label | http://localhost:8000 | AI inference (via Brev port-forward) |
| MONAI Label Docs | http://localhost:8000/docs | MONAI Label API docs |
| Orthanc Admin | http://localhost:8042/ui/app/ | DICOM management (admin) |
| PostgreSQL | localhost:5432 | Database |
| Redis | localhost:6379 | Cache / session |

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

### MONAI Label not reachable (localhost:8000)
Check step by step:
```bash
# 1. Is the instance running?
brev ls

# 2. Is MONAI Label running inside the instance?
brev exec medicalpower-monai "curl -s http://localhost:8000/info/" 2>&1 | head -5

# 3. Is port-forward running?
lsof -i :8000
```

If instance is stopped → `brev start medicalpower-monai`, wait ~2 minutes, then port-forward again.
If MONAI Label is not running → see section **8g** to start it.
If port-forward is disconnected → run `brev port-forward medicalpower-monai -p 8000:8000` again.

### OHIF MONAI Label panel shows "Failed to connect"
- Check the URL in panel Settings is `http://localhost:8000` (no trailing `/`)
- Check port-forward is active: `curl http://localhost:8000/info/`
- Try refreshing the OHIF page and click Connect again

## Login & Admin Dashboard

### Login

Go to http://localhost:3000/login. Dev accounts:

| Email | Password | Role | Admin Access |
|-------|----------|------|-------------|
| `admin@medicalpower.dev` | `admin123` | System Admin | Full access |
| `lead@medicalpower.dev` | `lead123` | Clinical Lead | Portal only |
| `annotator@medicalpower.dev` | `anno123` | Annotator | Portal only |
| `radiologist@medicalpower.dev` | `radio123` | Radiologist | Portal only |

After login:
- Sidebar shows user name and role
- Logout button at bottom of sidebar
- Login page has quick-login buttons for dev

### Admin Dashboard (Admin only)

Login with `admin@medicalpower.dev` to access:

- `/admin` — System overview (stats, recent activity, service status)
- `/admin/users` — User management (search, filter, block/unblock, delete)
- `/admin/system` — System monitoring:
  - **Services** tab: Auto health check of 10 services every 15 seconds
  - **Logs** tab: View system logs filtered by service (Docker, API, OHIF, MONAI)

## Next Steps

- Read [PLANNING.md](../PLANNING.md) for the full architecture overview
- Read [CLAUDE.md](../../CLAUDE.md) for coding conventions and rules
- Read [infrastructure.md](infrastructure.md) for detailed service documentation
