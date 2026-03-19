import asyncio

from fastapi import APIRouter, BackgroundTasks, HTTPException

from app.models.schemas import InferenceRequest, InferenceResponse, InferenceResult, JobStatus
from app.services.job_manager import InferenceJobManager

router = APIRouter(tags=["inference"])

job_manager = InferenceJobManager()


@router.post("/inference", response_model=InferenceResponse, status_code=202)
async def request_inference(
    request: InferenceRequest,
    background_tasks: BackgroundTasks,
):
    job_id = job_manager.create_job(
        model_id=request.model_id,
        model_version=request.model_version,
        study_uid=request.study_uid,
        series_uid=request.series_uid,
        params={
            "interaction_type": request.interaction_type.value,
            "output_format": request.output_format.value,
            "clicks": request.clicks,
            **request.params,
        },
    )

    background_tasks.add_task(job_manager.execute_job, job_id)

    return InferenceResponse(
        job_id=job_id,
        status=JobStatus.QUEUED,
        model_id=request.model_id,
        model_version=request.model_version,
        estimated_time_seconds=10,
        poll_url=f"/api/v1/inference/{job_id}",
    )


@router.get("/inference/{job_id}", response_model=InferenceResult)
async def get_inference_status(job_id: str):
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")

    download_url = None
    if job.get("artifact_key") and job["status"] == JobStatus.COMPLETED:
        download_url = job_manager.artifact_store.get_presigned_url(job["artifact_key"])

    return InferenceResult(
        job_id=job_id,
        status=job["status"],
        execution_time_ms=job.get("execution_time_ms"),
        artifact_id=job.get("artifact_key"),
        download_url=download_url,
        labels=job.get("labels", []),
        error_message=job.get("error_message"),
    )
