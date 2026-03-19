#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
OHIF_DIR="$ROOT_DIR/vendor/ohif-viewers"
MONAI_PLUGIN_DIR="$ROOT_DIR/vendor/monai-label/plugins/ohifv3"
DIST_DIR="$SCRIPT_DIR/dist"

echo "=== MedicalPower OHIF Build ==="
echo "OHIF source:   $OHIF_DIR"
echo "MONAI plugin:  $MONAI_PLUGIN_DIR"
echo "Output:        $DIST_DIR"
echo ""

if [ ! -d "$OHIF_DIR" ]; then
  echo "ERROR: OHIF Viewers not found at $OHIF_DIR"
  echo "Run: git submodule update --init --recursive"
  exit 1
fi

if [ ! -d "$MONAI_PLUGIN_DIR" ]; then
  echo "ERROR: MONAI Label plugin not found at $MONAI_PLUGIN_DIR"
  echo "Run: git submodule update --init --recursive"
  exit 1
fi

echo "[1/5] Linking MONAI Label extension into OHIF..."
ln -sfn "$MONAI_PLUGIN_DIR/extensions/monai-label" "$OHIF_DIR/extensions/monai-label"

echo "[2/5] Linking MONAI Label mode into OHIF..."
ln -sfn "$MONAI_PLUGIN_DIR/modes/monai-label" "$OHIF_DIR/modes/monai-label"

echo "[3/5] Copying MedicalPower config..."
cp "$SCRIPT_DIR/config/medicalpower.js" "$OHIF_DIR/platform/app/public/config/medicalpower.js"

echo "[4/5] Installing OHIF dependencies and building..."
cd "$OHIF_DIR"
yarn install --frozen-lockfile 2>/dev/null || yarn install
APP_CONFIG=config/medicalpower.js PUBLIC_URL=/ohif/ yarn run build

echo "[5/5] Copying build output..."
rm -rf "$DIST_DIR"
cp -r "$OHIF_DIR/platform/app/dist" "$DIST_DIR"

echo ""
echo "=== Build complete: $DIST_DIR ==="
