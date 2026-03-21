#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

log() { echo -e "${2:-$NC}[${1}]${NC} $3"; }

echo ""
echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}  MedicalPower — Development Environment${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""

# ─── Check prerequisites ──────────────────────────────────────
log "CHECK" "$BLUE" "Checking prerequisites..."

check_cmd() {
  if ! command -v "$1" &> /dev/null; then
    log "ERROR" "$RED" "$1 is not installed. $2"
    exit 1
  fi
}

check_cmd "node" "Install Node.js >= 20.9.0"
check_cmd "docker" "Install Docker Desktop"
check_cmd "npm" "Install npm"

# ─── Check ports ──────────────────────────────────────────────
check_port() {
  if lsof -i ":$1" &> /dev/null; then
    log "WARN" "$YELLOW" "Port $1 is already in use ($2 needs it)"
    return 1
  fi
  return 0
}

PORTS_OK=true
check_port 3000 "Portal Web" || PORTS_OK=false
check_port 4002 "patient-service" || PORTS_OK=false
check_port 5432 "PostgreSQL" || true
check_port 8042 "Orthanc" || true

if [ "$PORTS_OK" = false ]; then
  log "WARN" "$YELLOW" "Some app ports are in use. Services on those ports will fail to start."
  echo ""
fi

# ─── Stage 1: Docker Infrastructure ──────────────────────────
log "INFRA" "$PURPLE" "Starting Docker infrastructure..."

cd "$ROOT_DIR/infra/docker"

if [ ! -f .env ]; then
  cp .env.example .env
  log "INFRA" "$PURPLE" "Created .env from .env.example"
fi

docker compose -f docker-compose.dev.yml up -d postgres redis orthanc 2>&1 | grep -v "level=warning" || true

# ─── Wait for PostgreSQL ─────────────────────────────────────
log "INFRA" "$PURPLE" "Waiting for PostgreSQL to be ready..."
for i in $(seq 1 30); do
  if docker compose -f docker-compose.dev.yml exec -T postgres pg_isready -U mp_admin -d medicalpower &> /dev/null; then
    log "INFRA" "$GREEN" "PostgreSQL is ready"
    break
  fi
  if [ "$i" -eq 30 ]; then
    log "ERROR" "$RED" "PostgreSQL failed to start in 30 seconds"
    exit 1
  fi
  sleep 1
done

# ─── Stage 2: Database migration check ──────────────────────
log "DB" "$BLUE" "Checking database migrations..."
cd "$ROOT_DIR/packages/database"

if [ ! -d "node_modules" ]; then
  log "DB" "$BLUE" "Installing database package dependencies..."
  npm install --silent 2>&1 | tail -1
fi

npx prisma migrate deploy --schema=prisma/schema 2>&1 | grep -E "applied|already" || true
npx prisma generate --schema=prisma/schema 2>&1 | grep -E "Generated|already" || true
log "DB" "$GREEN" "Database is ready"

# ─── Stage 3: Build patient-service if needed ────────────────
log "API" "$CYAN" "Preparing patient-service..."
cd "$ROOT_DIR/services/patient-service"

if [ ! -d "node_modules" ]; then
  log "API" "$CYAN" "Installing patient-service dependencies..."
  npm install --silent 2>&1 | tail -1
  npx prisma generate --schema=../../packages/database/prisma/schema 2>&1 | grep -E "Generated" || true
fi

if [ ! -d "dist" ]; then
  log "API" "$CYAN" "Building patient-service..."
  npx nest build 2>&1
fi

# ─── Stage 4: Start services ────────────────────────────────
log "START" "$GREEN" "Starting all services..."
echo ""

cleanup() {
  echo ""
  log "STOP" "$YELLOW" "Shutting down services..."
  kill $PID_API 2>/dev/null || true
  kill $PID_PORTAL 2>/dev/null || true
  log "STOP" "$GREEN" "Services stopped. Docker infra still running."
  log "STOP" "$PURPLE" "To stop Docker: cd infra/docker && docker compose -f docker-compose.dev.yml down"
  exit 0
}

trap cleanup SIGINT SIGTERM

cd "$ROOT_DIR/services/patient-service"
DATABASE_URL="postgresql://mp_admin:mp_secret_dev@localhost:5432/medicalpower?schema=public" \
  node dist/main.js 2>&1 | sed "s/^/$(printf "${CYAN}[API]${NC} ")/" &
PID_API=$!

sleep 2

cd "$ROOT_DIR/apps/portal-web"
if [ ! -d "node_modules" ]; then
  log "WEB" "$BLUE" "Installing portal-web dependencies..."
  npm install --silent 2>&1 | tail -1
fi

npm run dev 2>&1 | sed "s/^/$(printf "${GREEN}[WEB]${NC} ")/" &
PID_PORTAL=$!

sleep 3

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  All services running!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "  ${GREEN}Portal Web:${NC}      http://localhost:3000"
echo -e "  ${CYAN}Patient API:${NC}     http://localhost:4002/api/v1/patients"
echo -e "  ${CYAN}Swagger Docs:${NC}    http://localhost:4002/docs"
echo -e "  ${PURPLE}Orthanc Admin:${NC}   http://localhost:8042/ui/app/"
echo -e "  ${PURPLE}PostgreSQL:${NC}      localhost:5432"
echo ""
echo -e "  ${YELLOW}OHIF Viewer:${NC}     Run separately: ./scripts/start-ohif-dev.sh"
echo ""
echo -e "  Press ${RED}Ctrl+C${NC} to stop Portal + API (Docker keeps running)"
echo ""

wait
