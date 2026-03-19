from fastapi import APIRouter, HTTPException

from app.models.schemas import ModelInfo
from app.services.monai_client import MONAILabelClient

router = APIRouter(tags=["models"])

monai_client = MONAILabelClient()


@router.get("/models", response_model=list[ModelInfo])
async def list_models():
    try:
        models = await monai_client.get_models()
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"MONAI Label server unavailable: {e}",
        )

    result = []
    for name, info in models.items():
        result.append(
            ModelInfo(
                id=name,
                name=name,
                description=info.get("description"),
                model_type=info.get("type", "unknown"),
                labels=info.get("labels", []),
            )
        )
    return result


@router.get("/models/{model_id}", response_model=ModelInfo)
async def get_model(model_id: str):
    try:
        models = await monai_client.get_models()
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"MONAI Label server unavailable: {e}",
        )

    info = models.get(model_id)
    if not info:
        raise HTTPException(status_code=404, detail=f"Model {model_id} not found")

    return ModelInfo(
        id=model_id,
        name=model_id,
        description=info.get("description"),
        model_type=info.get("type", "unknown"),
        labels=info.get("labels", []),
    )


@router.get("/models/health")
async def models_health():
    healthy = await monai_client.health_check()
    return {"monai_label": "healthy" if healthy else "unavailable"}
