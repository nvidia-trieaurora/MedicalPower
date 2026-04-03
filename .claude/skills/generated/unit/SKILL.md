---
name: unit
description: "Skill for the Unit area of MedicalPower. 15 symbols across 5 files."
---

# Unit

15 symbols | 5 files | Cohesion: 100%

## When to Use

- Working with code in `services/`
- Understanding how test_model_info, test_get_info, test_get_models work
- Modifying unit-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `services/segmentation-service/tests/unit/test_monai_client.py` | test_get_info, test_get_models, test_health_check_success, test_health_check_failure |
| `services/segmentation-service/tests/unit/test_schemas.py` | test_model_info, test_valid_request, test_custom_params |
| `services/segmentation-service/app/services/monai_client.py` | get_info, get_models, health_check |
| `services/segmentation-service/app/api/models.py` | list_models, get_model, models_health |
| `services/segmentation-service/app/models/schemas.py` | ModelInfo, InferenceRequest |

## Entry Points

Start here when exploring this area:

- **`test_model_info`** (Function) — `services/segmentation-service/tests/unit/test_schemas.py:64`
- **`test_get_info`** (Function) — `services/segmentation-service/tests/unit/test_monai_client.py:39`
- **`test_get_models`** (Function) — `services/segmentation-service/tests/unit/test_monai_client.py:59`
- **`get_info`** (Function) — `services/segmentation-service/app/services/monai_client.py:14`
- **`get_models`** (Function) — `services/segmentation-service/app/services/monai_client.py:20`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `ModelInfo` | Class | `services/segmentation-service/app/models/schemas.py` | 55 |
| `InferenceRequest` | Class | `services/segmentation-service/app/models/schemas.py` | 25 |
| `test_model_info` | Function | `services/segmentation-service/tests/unit/test_schemas.py` | 64 |
| `test_get_info` | Function | `services/segmentation-service/tests/unit/test_monai_client.py` | 39 |
| `test_get_models` | Function | `services/segmentation-service/tests/unit/test_monai_client.py` | 59 |
| `get_info` | Function | `services/segmentation-service/app/services/monai_client.py` | 14 |
| `get_models` | Function | `services/segmentation-service/app/services/monai_client.py` | 20 |
| `list_models` | Function | `services/segmentation-service/app/api/models.py` | 11 |
| `get_model` | Function | `services/segmentation-service/app/api/models.py` | 35 |
| `test_health_check_success` | Function | `services/segmentation-service/tests/unit/test_monai_client.py` | 17 |
| `test_health_check_failure` | Function | `services/segmentation-service/tests/unit/test_monai_client.py` | 29 |
| `health_check` | Function | `services/segmentation-service/app/services/monai_client.py` | 106 |
| `models_health` | Function | `services/segmentation-service/app/api/models.py` | 58 |
| `test_valid_request` | Function | `services/segmentation-service/tests/unit/test_schemas.py` | 15 |
| `test_custom_params` | Function | `services/segmentation-service/tests/unit/test_schemas.py` | 26 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Get_model → Get_info` | intra_community | 3 |
| `List_models → Get_info` | intra_community | 3 |

## How to Explore

1. `gitnexus_context({name: "test_model_info"})` — see callers and callees
2. `gitnexus_query({query: "unit"})` — find related execution flows
3. Read key files listed above for implementation details
