---
name: services
description: "Skill for the Services area of MedicalPower. 21 symbols across 8 files."
---

# Services

21 symbols | 8 files | Cohesion: 100%

## When to Use

- Working with code in `services/`
- Understanding how test_completed_result, test_failed_result, infer work
- Modifying services-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `services/segmentation-service/app/services/monai_client.py` | infer, train_start, train_status, MONAILabelClient |
| `services/segmentation-service/app/services/job_manager.py` | get_job, execute_job, __init__, create_job |
| `services/segmentation-service/app/services/artifact_store.py` | store_artifact, get_presigned_url, ArtifactStore |
| `services/segmentation-service/app/models/schemas.py` | InferenceResult, TrainingStatus, InferenceResponse |
| `services/segmentation-service/tests/unit/test_schemas.py` | test_completed_result, test_failed_result |
| `services/segmentation-service/app/api/inference.py` | get_inference_status, request_inference |
| `services/segmentation-service/app/api/training.py` | start_training, get_training_status |
| `services/segmentation-service/tests/unit/test_monai_client.py` | client |

## Entry Points

Start here when exploring this area:

- **`test_completed_result`** (Function) — `services/segmentation-service/tests/unit/test_schemas.py:41`
- **`test_failed_result`** (Function) — `services/segmentation-service/tests/unit/test_schemas.py:53`
- **`infer`** (Function) — `services/segmentation-service/app/services/monai_client.py:24`
- **`get_job`** (Function) — `services/segmentation-service/app/services/job_manager.py:44`
- **`execute_job`** (Function) — `services/segmentation-service/app/services/job_manager.py:47`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `InferenceResult` | Class | `services/segmentation-service/app/models/schemas.py` | 45 |
| `TrainingStatus` | Class | `services/segmentation-service/app/models/schemas.py` | 78 |
| `MONAILabelClient` | Class | `services/segmentation-service/app/services/monai_client.py` | 7 |
| `ArtifactStore` | Class | `services/segmentation-service/app/services/artifact_store.py` | 10 |
| `InferenceResponse` | Class | `services/segmentation-service/app/models/schemas.py` | 36 |
| `test_completed_result` | Function | `services/segmentation-service/tests/unit/test_schemas.py` | 41 |
| `test_failed_result` | Function | `services/segmentation-service/tests/unit/test_schemas.py` | 53 |
| `infer` | Function | `services/segmentation-service/app/services/monai_client.py` | 24 |
| `get_job` | Function | `services/segmentation-service/app/services/job_manager.py` | 44 |
| `execute_job` | Function | `services/segmentation-service/app/services/job_manager.py` | 47 |
| `store_artifact` | Function | `services/segmentation-service/app/services/artifact_store.py` | 30 |
| `get_presigned_url` | Function | `services/segmentation-service/app/services/artifact_store.py` | 54 |
| `get_inference_status` | Function | `services/segmentation-service/app/api/inference.py` | 43 |
| `train_start` | Function | `services/segmentation-service/app/services/monai_client.py` | 89 |
| `train_status` | Function | `services/segmentation-service/app/services/monai_client.py` | 100 |
| `start_training` | Function | `services/segmentation-service/app/api/training.py` | 11 |
| `get_training_status` | Function | `services/segmentation-service/app/api/training.py` | 29 |
| `client` | Function | `services/segmentation-service/tests/unit/test_monai_client.py` | 9 |
| `create_job` | Function | `services/segmentation-service/app/services/job_manager.py` | 18 |
| `request_inference` | Function | `services/segmentation-service/app/api/inference.py` | 13 |

## How to Explore

1. `gitnexus_context({name: "test_completed_result"})` — see callers and callees
2. `gitnexus_query({query: "services"})` — find related execution flows
3. Read key files listed above for implementation details
