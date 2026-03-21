#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
OHIF_DIR="$ROOT_DIR/vendor/ohif-viewers"
CONFIG_FILE="$ROOT_DIR/apps/ohif-shell/config/local_orthanc.js"

echo "============================================"
echo "  MedicalPower — Start OHIF Viewer (Dev)"
echo "============================================"

if [ ! -d "$OHIF_DIR" ]; then
  echo "ERROR: OHIF Viewers not found. Run: git submodule update --init --recursive"
  exit 1
fi

echo "Checking Orthanc connectivity..."
if curl -s -o /dev/null -w "%{http_code}" -u admin:mp_admin_2026 http://localhost:8042/system | grep -q "200"; then
  echo "✓ Orthanc is running"
else
  echo "⚠ Orthanc is not reachable at localhost:8042"
  echo "  Start it: cd infra/docker && docker compose -f docker-compose.dev.yml up -d orthanc"
fi

echo ""
echo "Copying config..."
cp "$CONFIG_FILE" "$OHIF_DIR/platform/app/public/config/local_orthanc.js"

echo "Installing OHIF dependencies (first time may take a few minutes)..."
cd "$OHIF_DIR"
if [ ! -d "node_modules" ]; then
  yarn install --frozen-lockfile 2>/dev/null || yarn install
fi

echo ""
echo "Starting OHIF dev server on port 3001..."
echo "  Orthanc:  http://localhost:8042"
echo "  OHIF:     http://localhost:3001"
echo "  View BUI TRONG TINH: http://localhost:3001/viewer?StudyInstanceUIDs=1.2.840.113704.1.111.13428.1678778829.1"
echo ""

APP_CONFIG=config/local_orthanc.js \
  OHIF_PORT=3001 \
  PROXY_TARGET=http://localhost:8042 \
  PROXY_DOMAIN=http://localhost:8042 \
  PROXY_PATH_REWRITE_FROM=/pacs \
  PROXY_PATH_REWRITE_TO=/ \
  yarn run dev
