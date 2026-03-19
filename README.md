# MedicalPower

Production-grade medical imaging annotation and case management platform.

Built on **OHIF Viewer**, **MONAI Label**, and a dedicated workflow management engine.

## Architecture

- **Portal Web** — Next.js application for patient/case/task management
- **OHIF Viewer** — Medical image viewer with custom MONAI Label extensions
- **Backend Services** — NestJS microservices for domain logic
- **Segmentation Service** — FastAPI service orchestrating MONAI Label AI inference
- **Infrastructure** — PostgreSQL, Redis, RabbitMQ, MinIO, Orthanc, Keycloak

See [docs/PLANNING.md](docs/PLANNING.md) for the full architecture and planning document.

## Quick Start

### Prerequisites

- Node.js >= 20.9.0
- pnpm >= 9.0.0
- Docker & Docker Compose
- NVIDIA GPU + CUDA (for MONAI Label — optional for non-AI development)

### Setup

```bash
# Clone with submodules
git clone --recurse-submodules <repo-url>
cd MedicalPower

# Or initialize submodules after clone
git submodule update --init --recursive

# Install dependencies
pnpm install

# Start infrastructure (PostgreSQL, Redis, RabbitMQ, MinIO, Orthanc, Keycloak)
cd infra/docker
docker compose -f docker-compose.dev.yml up -d

# Start MONAI Label (requires GPU)
docker compose -f docker-compose.dev.yml --profile gpu up -d monai-label

# Start development servers
pnpm dev
```

### Without GPU (skip MONAI Label)

```bash
cd infra/docker
docker compose -f docker-compose.dev.yml up -d
pnpm dev
```

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
