#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
OHIF_DIR="$ROOT_DIR/vendor/ohif-viewers"
MONAI_PLUGIN_DIR="$ROOT_DIR/vendor/monai-label/plugins/ohifv3"
SHELL_DIR="$ROOT_DIR/apps/ohif-shell"
CONFIG_FILE="$SHELL_DIR/config/local_orthanc.js"

echo "============================================"
echo "  MedicalPower — Start OHIF Viewer (Dev)"
echo "  with MONAI Label Integration"
echo "============================================"

if [ ! -d "$OHIF_DIR" ]; then
  echo "ERROR: OHIF Viewers not found. Run: git submodule update --init --recursive"
  exit 1
fi

if [ ! -d "$MONAI_PLUGIN_DIR" ]; then
  echo "ERROR: MONAI Label plugin not found. Run: git submodule update --init --recursive"
  exit 1
fi

echo ""
echo "Checking service connectivity..."

if curl -s -o /dev/null -w "%{http_code}" -u admin:mp_admin_2026 http://localhost:8042/system | grep -q "200"; then
  echo "  ✓ Orthanc is running at localhost:8042"
else
  echo "  ⚠ Orthanc is not reachable at localhost:8042"
  echo "    Start it: cd infra/docker && docker compose -f docker-compose.dev.yml up -d orthanc"
fi

if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/info/ 2>/dev/null | grep -q "200"; then
  echo "  ✓ MONAI Label is running at localhost:8000"
else
  echo "  ⚠ MONAI Label is not reachable at localhost:8000"
  echo "    Port forward: brev port-forward medicalpower-monai -p 8000:8000"
fi

echo ""
echo "Copying MONAI Label extension & mode into OHIF..."
if [ ! -d "$OHIF_DIR/extensions/monai-label/src" ]; then
  cp -r "$MONAI_PLUGIN_DIR/extensions/monai-label" "$OHIF_DIR/extensions/monai-label"
  cp -r "$MONAI_PLUGIN_DIR/modes/monai-label" "$OHIF_DIR/modes/monai-label"
  rm -rf "$OHIF_DIR/extensions/monai-label/node_modules" "$OHIF_DIR/modes/monai-label/node_modules"
  rm -rf "$OHIF_DIR/extensions/monai-label/.webpack" "$OHIF_DIR/modes/monai-label/.webpack"
  NEED_INSTALL=true
  echo "  ✓ MONAI Label plugin copied (first time)"
else
  echo "  ✓ MONAI Label plugin already present"
fi

echo ""
echo "Copying MedicalPower config & plugins..."
cp "$CONFIG_FILE" "$OHIF_DIR/platform/app/public/config/local_orthanc.js"
cp "$SHELL_DIR/pluginConfig.json" "$OHIF_DIR/platform/app/pluginConfig.json"
echo "  ✓ Config files copied"

echo ""
echo "Installing OHIF dependencies (first time may take a few minutes)..."
cd "$OHIF_DIR"
if [ ! -d "node_modules" ] || [ "$NEED_INSTALL" = "true" ]; then
  yarn install --network-timeout 300000 2>/dev/null || yarn install --network-timeout 300000
fi

echo ""
echo "Starting OHIF dev server on port 3001..."
echo ""
echo "  OHIF Viewer:    http://localhost:3001"
echo "  Orthanc:        http://localhost:8042"
echo "  MONAI Label:    http://localhost:8000 (proxied at /monai/)"
echo ""
echo "  Study list:     http://localhost:3001"
echo "  Viewer (CT):    http://localhost:3001/viewer?StudyInstanceUIDs=1.2.840.113704.1.111.13428.1678778829.1"
echo "  MONAI Label:    http://localhost:3001/monai-label?StudyInstanceUIDs=1.2.840.113704.1.111.13428.1678778829.1"
echo ""

APP_CONFIG=config/local_orthanc.js \
  OHIF_PORT=3001 \
  PROXY_TARGET=http://localhost:8042 \
  PROXY_DOMAIN=http://localhost:8042 \
  PROXY_PATH_REWRITE_FROM=/pacs \
  PROXY_PATH_REWRITE_TO=/ \
  yarn run dev
