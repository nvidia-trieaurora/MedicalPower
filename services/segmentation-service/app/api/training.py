from fastapi import APIRouter, HTTPException

from app.models.schemas import TrainingRequest, TrainingStatus
from app.services.monai_client import MONAILabelClient

router = APIRouter(tags=["training"])

monai_client = MONAILabelClient()


@router.post("/training/runs", response_model=TrainingStatus, status_code=202)
async def start_training(request: TrainingRequest):
    try:
        result = await monai_client.train_start(
            model=request.model_id,
            params=request.config,
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Training failed to start: {e}")

    return TrainingStatus(
        run_id=result.get("id", "unknown"),
        status="started",
        progress=0.0,
        metrics={},
    )


@router.get("/training/status", response_model=TrainingStatus)
async def get_training_status():
    try:
        result = await monai_client.train_status()
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Cannot get training status: {e}")

    return TrainingStatus(
        run_id=result.get("id", "unknown"),
        status=result.get("status", "unknown"),
        progress=result.get("details", {}).get("progress"),
        metrics=result.get("details", {}),
    )


@router.get("/training/candidates")
async def list_training_candidates():
    """List approved annotations eligible for training data curation."""
    return {
        "candidates": [],
        "total": 0,
        "message": "Training candidate curation — not yet implemented (Phase 5)",
    }
