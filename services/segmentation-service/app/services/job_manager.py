import asyncio
import time
import uuid
from typing import Any

from app.models.schemas import InferenceResult, JobStatus
from app.services.artifact_store import ArtifactStore
from app.services.monai_client import MONAILabelClient


class InferenceJobManager:
    """Manages inference job lifecycle: queuing, execution, result storage."""

    def __init__(self):
        self.monai_client = MONAILabelClient()
        self.artifact_store = ArtifactStore()
        self._jobs: dict[str, dict[str, Any]] = {}

    def create_job(
        self,
        model_id: str,
        model_version: str,
        study_uid: str,
        series_uid: str,
        params: dict[str, Any],
    ) -> str:
        job_id = f"job_{uuid.uuid4().hex[:12]}"
        self._jobs[job_id] = {
            "job_id": job_id,
            "model_id": model_id,
            "model_version": model_version,
            "study_uid": study_uid,
            "series_uid": series_uid,
            "params": params,
            "status": JobStatus.QUEUED,
            "created_at": time.time(),
            "completed_at": None,
            "execution_time_ms": None,
            "artifact_key": None,
            "labels": [],
            "error_message": None,
        }
        return job_id

    def get_job(self, job_id: str) -> dict[str, Any] | None:
        return self._jobs.get(job_id)

    async def execute_job(self, job_id: str) -> InferenceResult:
        job = self._jobs.get(job_id)
        if not job:
            return InferenceResult(
                job_id=job_id,
                status=JobStatus.FAILED,
                error_message="Job not found",
            )

        job["status"] = JobStatus.RUNNING
        start_time = time.time()

        try:
            result_bytes = await self.monai_client.infer(
                model=job["model_id"],
                image_id=job["series_uid"],
                params=job["params"],
            )

            artifact_key = self.artifact_store.store_artifact(
                data=result_bytes,
                artifact_type="segmentation",
                metadata={
                    "model_id": job["model_id"],
                    "model_version": job["model_version"],
                    "study_uid": job["study_uid"],
                    "series_uid": job["series_uid"],
                },
            )

            elapsed_ms = int((time.time() - start_time) * 1000)
            job["status"] = JobStatus.COMPLETED
            job["completed_at"] = time.time()
            job["execution_time_ms"] = elapsed_ms
            job["artifact_key"] = artifact_key

            download_url = self.artifact_store.get_presigned_url(artifact_key)

            return InferenceResult(
                job_id=job_id,
                status=JobStatus.COMPLETED,
                execution_time_ms=elapsed_ms,
                artifact_id=artifact_key,
                download_url=download_url,
                labels=job.get("labels", []),
            )

        except Exception as e:
            elapsed_ms = int((time.time() - start_time) * 1000)
            job["status"] = JobStatus.FAILED
            job["completed_at"] = time.time()
            job["execution_time_ms"] = elapsed_ms
            job["error_message"] = str(e)

            return InferenceResult(
                job_id=job_id,
                status=JobStatus.FAILED,
                execution_time_ms=elapsed_ms,
                error_message=str(e),
            )
