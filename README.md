# MedicalPower

Production-grade medical imaging annotation and case management platform.

Built on **OHIF Viewer**, **MONAI Label**, and a dedicated workflow management engine.

## Architecture

- **Portal Web** — Next.js application for patient/case/task management
- **OHIF Viewer** — Medical image viewer with custom MONAI Label extensions
- **Backend Services** — NestJS microservices for domain logic
- **Segmentation Service** — FastAPI service orchestrating MONAI Label AI inference
- **Infrastructure** — PostgreSQL, Redis, RabbitMQ, MinIO, Orthanc, Keycloak

## Documentation

| Document | Ngôn ngữ | Mô tả |
|----------|---------|-------|
| [Getting Started (VI)](docs/vi/getting-started.md) | Tiếng Việt | Hướng dẫn cài đặt và chạy từng bước |
| [Getting Started (EN)](docs/en/getting-started.md) | English | Step-by-step setup and run guide |
| [PLANNING.md](docs/PLANNING.md) | Bilingual | Full architecture and planning (3600+ lines) |
| [CLAUDE.md](CLAUDE.md) | English | Project rules, conventions, architecture decisions |
| [Infrastructure](docs/en/infrastructure.md) | English | Database, Docker, ports reference |
| [CHANGELOG](docs/CHANGELOG.md) | English | Dated log of all changes |

## Quick Start

### Prerequisites

- Node.js >= 20.9.0
- Docker & Docker Compose
- NVIDIA GPU + CUDA (optional — only for MONAI Label AI inference)

### One Command Start

```bash
git clone --recurse-submodules https://github.com/nvidia-trieaurora/MedicalPower.git
cd MedicalPower
./scripts/dev.sh
```

This starts Docker infrastructure, database, backend API, and portal web — all with one command.

| Service | URL |
|---------|-----|
| Portal Web | http://localhost:3000 |
| Patient API | http://localhost:4002/api/v1/patients |
| Swagger Docs | http://localhost:4002/docs |
| Orthanc Admin | http://localhost:8042/ui/app/ |

Press `Ctrl+C` to stop. See [Getting Started (VI)](docs/vi/getting-started.md) or [Getting Started (EN)](docs/en/getting-started.md) for detailed step-by-step instructions.

## Project Structure

```
MedicalPower/
├── apps/                    # Frontend applications
│   ├── portal-web/          # Next.js patient/case management portal
│   ├── ohif-shell/          # OHIF Viewer with custom extensions
│   └── admin-web/           # Admin console
├── services/                # Backend microservices
│   ├── segmentation-service/  # FastAPI — AI/MONAI orchestration
│   └── *-service/           # NestJS domain services
├── packages/                # Shared packages
│   ├── ui/                  # Shared React components
│   ├── types/               # Shared TypeScript types
│   ├── i18n/                # Vietnamese/English translations
│   └── ...
├── vendor/                  # Upstream dependencies (git submodules)
│   ├── ohif-viewers/        # OHIF Viewer v3.12.0
│   └── monai-label/         # MONAI Label v0.8.5
├── infra/                   # Infrastructure configs
│   ├── docker/              # Docker Compose files
│   ├── k8s/                 # Kubernetes manifests
│   └── ...
├── scripts/                 # Development scripts
└── docs/                    # Documentation
```

## Bilingual Support

The platform supports Vietnamese and English throughout. Translation files are in `packages/i18n/locales/`.

## License

Proprietary. See LICENSE for details.
