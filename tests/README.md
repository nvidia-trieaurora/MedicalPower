# MedicalPower Test Strategy

## Directory Structure

```
tests/                              # Cross-service tests
├── integration/                    # Multi-service integration tests
├── e2e/                           # End-to-end tests
└── fixtures/                      # Shared test data (DICOM samples, JSON payloads)

services/<name>-service/tests/
├── unit/                          # Unit tests (isolated, mocked dependencies)
└── integration/                   # Service-level integration tests (with DB)

apps/portal-web/tests/             # Frontend component and page tests
```

## Conventions

- **Unit tests:** `*.spec.ts` (NestJS), `test_*.py` (Python)
- **Integration tests:** `*.integration.spec.ts`, `test_*_integration.py`
- **E2E tests:** `*.e2e.spec.ts`
- **Coverage target:** 80%+ for business logic, 60%+ overall

## Running Tests

```bash
# All tests
pnpm test

# Single service
cd services/patient-service && npm test

# With coverage
cd services/patient-service && npm run test:cov

# Python service
cd services/segmentation-service && pytest

# E2E (requires Docker infrastructure)
pnpm test:e2e
```

## Test Data

- Mock patients, studies, cases in `tests/fixtures/`
- Sample DICOM files: use scripts/upload-dicom.sh for Orthanc
- Never use real patient data in tests — always anonymized/synthetic
