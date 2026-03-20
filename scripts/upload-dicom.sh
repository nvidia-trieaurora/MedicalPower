#!/bin/bash
set -euo pipefail

ORTHANC_URL="${ORTHANC_URL:-http://localhost:8042}"
ORTHANC_USER="${ORTHANC_USER:-admin}"
ORTHANC_PASS="${ORTHANC_PASS:-mp_admin_2026}"
DICOM_DIR="${1:?Usage: $0 <path-to-dicom-folder>}"

if [ ! -d "$DICOM_DIR" ]; then
  echo "ERROR: Directory not found: $DICOM_DIR"
  exit 1
fi

echo "============================================"
echo "  MedicalPower — Upload DICOM to Orthanc"
echo "============================================"
echo "  Orthanc:  $ORTHANC_URL"
echo "  Source:   $DICOM_DIR"
echo ""

echo -n "Checking Orthanc connectivity... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -u "$ORTHANC_USER:$ORTHANC_PASS" "$ORTHANC_URL/system")
if [ "$HTTP_CODE" != "200" ]; then
  echo "FAILED (HTTP $HTTP_CODE)"
  echo "Make sure Orthanc is running: cd infra/docker && docker compose -f docker-compose.dev.yml up -d orthanc"
  exit 1
fi
echo "OK"

TOTAL=$(find "$DICOM_DIR" -name "*.dcm" | wc -l | tr -d ' ')
echo "Found $TOTAL DICOM files"
echo ""

UPLOADED=0
FAILED=0

find "$DICOM_DIR" -name "*.dcm" -print0 | while IFS= read -r -d '' dcm_file; do
  UPLOADED=$((UPLOADED + 1))
  printf "\r  Uploading %d/%d: %s" "$UPLOADED" "$TOTAL" "$(basename "$dcm_file")"

  RESULT=$(curl -s -o /dev/null -w "%{http_code}" \
    -u "$ORTHANC_USER:$ORTHANC_PASS" \
    -X POST \
    -H "Content-Type: application/dicom" \
    --data-binary "@$dcm_file" \
    "$ORTHANC_URL/instances")

  if [ "$RESULT" != "200" ]; then
    FAILED=$((FAILED + 1))
  fi
done

echo ""
echo ""
echo "============================================"
echo "  Upload complete!"
echo "============================================"

echo ""
echo "Verifying..."
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
