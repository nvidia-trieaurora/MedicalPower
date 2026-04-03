#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

ORTHANC_URL="${ORTHANC_URL:-http://localhost:8042}"
ORTHANC_USER="${ORTHANC_USER:-admin}"
ORTHANC_PASS="${ORTHANC_PASS:-mp_admin_2026}"

DICOM_BASE="${DICOM_BASE:-/Users/tlle/Documents/PersonalProject}"

PATIENT_DIRS=(
  "BUI_TRONG_TINH 23057406"
  "BUI_VIET_LAM 15122510"
  "BUI_THE_THIEM 13093945"
)

echo "============================================"
echo "  MedicalPower — Upload All Patient DICOM"
echo "============================================"
echo "  Orthanc:  $ORTHANC_URL"
echo "  Source:   $DICOM_BASE"
echo ""

echo -n "Checking Orthanc connectivity... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -u "$ORTHANC_USER:$ORTHANC_PASS" "$ORTHANC_URL/system")
if [ "$HTTP_CODE" != "200" ]; then
  echo "FAILED (HTTP $HTTP_CODE)"
  echo "Start Orthanc: cd infra/docker && docker compose -f docker-compose.dev.yml up -d orthanc"
  exit 1
fi
echo "OK"
echo ""

TOTAL_UPLOADED=0
TOTAL_FAILED=0

for patient_dir in "${PATIENT_DIRS[@]}"; do
  full_path="$DICOM_BASE/$patient_dir"

  if [ ! -d "$full_path" ]; then
    echo "⚠ SKIP: $patient_dir (directory not found)"
    continue
  fi

  file_count=$(find "$full_path" -name "*.dcm" | wc -l | tr -d ' ')
  echo "▶ $patient_dir ($file_count files)"

  uploaded=0
  failed=0

  find "$full_path" -name "*.dcm" -print0 | while IFS= read -r -d '' dcm_file; do
    uploaded=$((uploaded + 1))
    printf "\r  Uploading %d/%d..." "$uploaded" "$file_count"

    result=$(curl -s -o /dev/null -w "%{http_code}" \
      -u "$ORTHANC_USER:$ORTHANC_PASS" \
      -X POST \
      -H "Content-Type: application/dicom" \
      --data-binary "@$dcm_file" \
      "$ORTHANC_URL/instances")

    if [ "$result" != "200" ]; then
      failed=$((failed + 1))
    fi
  done

  echo ""
  echo "  ✓ Done"
  echo ""
done

echo "============================================"
echo "  Upload complete!"
echo "============================================"
echo ""
echo "Verifying Orthanc data..."
PATIENTS=$(curl -s -u "$ORTHANC_USER:$ORTHANC_PASS" "$ORTHANC_URL/patients" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "?")
STUDIES=$(curl -s -u "$ORTHANC_USER:$ORTHANC_PASS" "$ORTHANC_URL/studies" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "?")
SERIES=$(curl -s -u "$ORTHANC_USER:$ORTHANC_PASS" "$ORTHANC_URL/series" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "?")
INSTANCES=$(curl -s -u "$ORTHANC_USER:$ORTHANC_PASS" "$ORTHANC_URL/instances" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "?")

echo "  Patients:  $PATIENTS"
echo "  Studies:   $STUDIES"
echo "  Series:    $SERIES"
echo "  Instances: $INSTANCES"
echo ""
echo "  Orthanc Admin:  $ORTHANC_URL  (admin / mp_admin_2026)"
echo "  OHIF Viewer:    http://localhost:3001"
echo ""
