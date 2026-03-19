# OHIF Shell — MedicalPower Viewer

Custom OHIF Viewer build with MONAI Label integration and MedicalPower extensions.

## Architecture

- **Upstream OHIF Viewer** — `vendor/ohif-viewers/` (git submodule, v3.12.0)
- **MONAI Label Extension** — from `vendor/monai-label/plugins/ohifv3/`
- **Custom Extensions:**
  - `annotation-save` — saves annotations to MedicalPower annotation-service
  - `task-context` — receives task/case context from portal deep-links
- **Custom Mode:**
  - `annotation-mode` — annotation workflow layout with MONAI Label panel

## Build

```bash
# From repo root
./apps/ohif-shell/build.sh

# Or via Docker
docker build -f apps/ohif-shell/Dockerfile -t medicalpower-ohif .
```

## Configuration

- `config/medicalpower.js` — OHIF runtime config (DICOMweb, OIDC, branding)
- `pluginConfig.json` — Extension and mode registration
- `nginx.conf` — Reverse proxy for DICOMweb and MONAI Label

## Deep-Link Format

Portal launches OHIF with:
```
/ohif/viewer?StudyInstanceUIDs=1.2.3.4&taskId=task_001&caseId=case_001&patientName=Nguyen+Van+An
```
