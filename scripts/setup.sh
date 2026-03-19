#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "============================================"
echo "  MedicalPower — Development Setup"
echo "============================================"
echo ""

# 1. Check prerequisites
echo "[1/6] Checking prerequisites..."

check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo "  ERROR: $1 is not installed. $2"
        exit 1
    fi
    echo "  ✓ $1 found"
}

check_command "node" "Install Node.js >= 20.9.0 from https://nodejs.org"
check_command "pnpm" "Install pnpm: npm install -g pnpm"
check_command "docker" "Install Docker from https://docker.com"
check_command "git" "Install git"

NODE_VERSION=$(node -v | sed 's/v//')
REQUIRED_NODE="20.9.0"
if [ "$(printf '%s\n' "$REQUIRED_NODE" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_NODE" ]; then
    echo "  WARNING: Node.js $NODE_VERSION detected. Recommended: >= $REQUIRED_NODE"
fi

echo ""

# 2. Initialize git submodules
echo "[2/6] Initializing git submodules (OHIF Viewers + MONAI Label)..."
cd "$ROOT_DIR"
if [ -d "vendor/ohif-viewers/.git" ] && [ -d "vendor/monai-label/.git" ]; then
    echo "  ✓ Submodules already initialized"
else
    git submodule update --init --recursive
    echo "  ✓ Submodules initialized"
fi
echo ""

# 3. Install Node.js dependencies
echo "[3/6] Installing Node.js dependencies..."
cd "$ROOT_DIR"
pnpm install
echo "  ✓ Dependencies installed"
echo ""

# 4. Copy environment file
echo "[4/6] Setting up environment..."
if [ ! -f "$ROOT_DIR/infra/docker/.env" ]; then
    cp "$ROOT_DIR/infra/docker/.env.example" "$ROOT_DIR/infra/docker/.env"
    echo "  ✓ Created infra/docker/.env from .env.example"
else
    echo "  ✓ infra/docker/.env already exists"
fi
echo ""

# 5. Start infrastructure
echo "[5/6] Starting infrastructure containers..."
cd "$ROOT_DIR/infra/docker"
docker compose -f docker-compose.dev.yml up -d
echo ""

echo "  Waiting for services to become healthy..."
sleep 5

SERVICES=("postgres" "redis" "rabbitmq" "minio" "orthanc" "keycloak")
for svc in "${SERVICES[@]}"; do
    echo -n "  Waiting for $svc..."
    for i in $(seq 1 30); do
        if docker compose -f docker-compose.dev.yml ps "$svc" 2>/dev/null | grep -q "healthy\|running"; then
            echo " ✓"
            break
        fi
        if [ "$i" -eq 30 ]; then
            echo " (timeout — check docker logs)"
        fi
        sleep 2
    done
done
echo ""

# 6. Summary
echo "[6/6] Setup complete!"
echo ""
echo "============================================"
echo "  Services Running"
echo "============================================"
echo "  PostgreSQL:    localhost:5432"
echo "  Redis:         localhost:6379"
echo "  RabbitMQ:      localhost:5672  (management: localhost:15672)"
echo "  MinIO:         localhost:9000  (console: localhost:9001)"
echo "  Orthanc:       localhost:8042  (DICOM: localhost:4242)"
echo "  Keycloak:      localhost:8080"
echo ""
echo "  MONAI Label (GPU required):"
echo "    docker compose -f infra/docker/docker-compose.dev.yml --profile gpu up -d monai-label"
echo "    Access: localhost:8000"
echo ""
echo "============================================"
echo "  Default Credentials"
echo "============================================"
echo "  Keycloak Admin:   admin / admin_dev"
echo "  Portal Users:     (see infra/keycloak/realm-export.json)"
echo "  RabbitMQ:         mp_user / mp_rabbit_dev"
echo "  MinIO:            mp_minio_dev / mp_minio_secret_dev"
echo ""
echo "============================================"
echo "  Next Steps"
echo "============================================"
echo "  1. pnpm dev                          — start development servers"
echo "  2. Upload DICOM to Orthanc:          localhost:8042"
echo "  3. Open Keycloak admin:              localhost:8080"
echo "  4. See docs/PLANNING.md for the full architecture"
echo ""
