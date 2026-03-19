from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class JobStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class InteractionType(str, Enum):
    AUTO = "auto"
    CLICKS = "clicks"
    SCRIBBLES = "scribbles"


class OutputFormat(str, Enum):
    NIFTI = "nifti"
    DICOM_SEG = "dicom_seg"


class InferenceRequest(BaseModel):
    model_id: str
    model_version: str = "latest"
    study_uid: str
    series_uid: str
    params: dict[str, Any] = Field(default_factory=dict)
    interaction_type: InteractionType = InteractionType.AUTO
    output_format: OutputFormat = OutputFormat.NIFTI
    clicks: list[dict[str, Any]] | None = None


class InferenceResponse(BaseModel):
    job_id: str
    status: JobStatus
    model_id: str
    model_version: str
    estimated_time_seconds: int | None = None
    poll_url: str


class InferenceResult(BaseModel):
    job_id: str
    status: JobStatus
    execution_time_ms: int | None = None
    artifact_id: str | None = None
    download_url: str | None = None
    labels: list[str] = Field(default_factory=list)
    error_message: str | None = None


class ModelInfo(BaseModel):
    id: str
    name: str
    description: str | None = None
    model_type: str
    labels: list[str] = Field(default_factory=list)


class ModelVersionInfo(BaseModel):
    id: str
    model_id: str
    version: str
    status: str
    metrics: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime | None = None


class TrainingRequest(BaseModel):
    model_id: str
    dataset_ids: list[str]
    config: dict[str, Any] = Field(default_factory=dict)


class TrainingStatus(BaseModel):
    run_id: str
    status: str
    progress: float | None = None
    metrics: dict[str, Any] = Field(default_factory=dict)
