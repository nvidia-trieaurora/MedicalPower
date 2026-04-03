#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
OHIF_DIR="$ROOT_DIR/vendor/ohif-viewers"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

log() { echo -e "${2:-$NC}[${1}]${NC} $3"; }

echo ""
echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}  MedicalPower — Development Environment${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""

SKIP_OHIF=false
for arg in "$@"; do
  case $arg in
    --no-ohif) SKIP_OHIF=true ;;
  esac
done

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

HAS_YARN=true
if ! command -v yarn &> /dev/null; then
  HAS_YARN=false
  if [ "$SKIP_OHIF" = false ]; then
    log "WARN" "$YELLOW" "yarn not found — OHIF Viewer will be skipped. Install: npm install -g yarn"
    SKIP_OHIF=true
  fi
fi

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
check_port 4006 "workflow-service" || PORTS_OK=false
if [ "$SKIP_OHIF" = false ]; then
  check_port 3001 "OHIF Viewer" || PORTS_OK=false
fi
check_port 5432 "PostgreSQL" || true
check_port 8042 "Orthanc" || true

if [ "$PORTS_OK" = false ]; then
  log "WARN" "$YELLOW" "Some app ports are in use. Services on those ports may fail to start."
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

# ─── Stage 3: Build backend services ─────────────────────────
for svc in patient-service workflow-service; do
  log "API" "$CYAN" "Preparing $svc..."
  cd "$ROOT_DIR/services/$svc"

  if [ ! -d "node_modules" ]; then
    log "API" "$CYAN" "Installing $svc dependencies..."
    npm install --silent 2>&1 | tail -1
  fi

  npx prisma generate --schema=../../packages/database/prisma/schema 2>&1 | grep -E "Generated" || true
  mkdir -p node_modules/.prisma/client
  cp -r ../../packages/database/node_modules/.prisma/client/* node_modules/.prisma/client/ 2>/dev/null || true
  cp -r ../../packages/database/node_modules/@prisma/client/* node_modules/@prisma/client/ 2>/dev/null || true

  if [ ! -d "dist" ] || [ "$(find src -newer dist/main.js -name '*.ts' 2>/dev/null | head -1)" ]; then
    log "API" "$CYAN" "Building $svc..."
    npx nest build 2>&1
  fi
done

# ─── Stage 4: Prepare OHIF Viewer ────────────────────────────
if [ "$SKIP_OHIF" = false ]; then
  log "OHIF" "$WHITE" "Preparing OHIF Viewer..."

  if [ ! -d "$OHIF_DIR" ]; then
    log "ERROR" "$RED" "OHIF Viewers not found. Run: git submodule update --init --recursive"
    SKIP_OHIF=true
  else
    cp "$ROOT_DIR/apps/ohif-shell/config/local_orthanc.js" "$OHIF_DIR/platform/app/public/config/local_orthanc.js"

    if [ ! -d "$OHIF_DIR/node_modules" ]; then
      log "OHIF" "$WHITE" "Installing OHIF dependencies (first time — may take 5-10 minutes)..."
      cd "$OHIF_DIR"
      yarn install --frozen-lockfile 2>&1 | tail -3 || yarn install 2>&1 | tail -3
      log "OHIF" "$GREEN" "OHIF dependencies installed"
    fi
  fi
fi

# ─── Stage 5: Start all services ────────────────────────────
log "START" "$GREEN" "Starting all services..."
echo ""

PID_PATIENT=""
PID_WORKFLOW=""
PID_PORTAL=""
PID_OHIF=""

cleanup() {
  echo ""
  log "STOP" "$YELLOW" "Shutting down services..."
  [ -n "$PID_PATIENT" ] && kill $PID_PATIENT 2>/dev/null || true
  [ -n "$PID_WORKFLOW" ] && kill $PID_WORKFLOW 2>/dev/null || true
  [ -n "$PID_PORTAL" ] && kill $PID_PORTAL 2>/dev/null || true
  [ -n "$PID_OHIF" ] && kill $PID_OHIF 2>/dev/null || true
  log "STOP" "$GREEN" "Services stopped. Docker infra still running."
  log "STOP" "$PURPLE" "To stop Docker: cd infra/docker && docker compose -f docker-compose.dev.yml down"
  exit 0
}

trap cleanup SIGINT SIGTERM

# Start patient-service (:4002)
cd "$ROOT_DIR/services/patient-service"
DATABASE_URL="postgresql://mp_admin:mp_secret_dev@localhost:5432/medicalpower?schema=public" \
  node dist/main.js 2>&1 | sed "s/^/$(printf "${CYAN}[patient-api]${NC} ")/" &
PID_PATIENT=$!

# Start workflow-service (:4006)
cd "$ROOT_DIR/services/workflow-service"
DATABASE_URL="postgresql://mp_admin:mp_secret_dev@localhost:5432/medicalpower?schema=public" \
  node dist/main.js 2>&1 | sed "s/^/$(printf "${PURPLE}[workflow-api]${NC} ")/" &
PID_WORKFLOW=$!

sleep 2

# Start portal-web
cd "$ROOT_DIR/apps/portal-web"
if [ ! -d "node_modules" ]; then
  log "WEB" "$BLUE" "Installing portal-web dependencies..."
  npm install --silent 2>&1 | tail -1
fi

npm run dev 2>&1 | sed "s/^/$(printf "${GREEN}[WEB]${NC} ")/" &
PID_PORTAL=$!

# Start OHIF Viewer
if [ "$SKIP_OHIF" = false ]; then
  sleep 2
  cd "$OHIF_DIR"
  APP_CONFIG=config/local_orthanc.js \
  OHIF_PORT=3001 \
  PROXY_TARGET=http://localhost:8042 \
  PROXY_DOMAIN=http://localhost:8042 \
  PROXY_PATH_REWRITE_FROM=/pacs \
  PROXY_PATH_REWRITE_TO=/ \
  yarn run dev 2>&1 | sed "s/^/$(printf "${WHITE}[OHIF]${NC} ")/" &
  PID_OHIF=$!
fi

sleep 4

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  All services running!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "  ${GREEN}Portal Web:${NC}      http://localhost:3000"
echo -e "  ${CYAN}Patient API:${NC}     http://localhost:4002/api/v1/patients"
echo -e "  ${CYAN}Patient Docs:${NC}    http://localhost:4002/docs"
echo -e "  ${PURPLE}Workflow API:${NC}    http://localhost:4006/api/v1/cases"
echo -e "  ${PURPLE}Workflow Docs:${NC}   http://localhost:4006/docs"
echo -e "  ${PURPLE}Orthanc Admin:${NC}   http://localhost:8042/ui/app/"
if [ "$SKIP_OHIF" = false ]; then
echo -e "  ${WHITE}OHIF Viewer:${NC}     http://localhost:3001"
echo -e "  ${WHITE}View CT Scan:${NC}    http://localhost:3001/viewer?StudyInstanceUIDs=1.2.840.113704.1.111.13428.1678778829.1"
fi
echo ""
echo -e "  Press ${RED}Ctrl+C${NC} to stop all app services (Docker keeps running)"
echo ""

wait
