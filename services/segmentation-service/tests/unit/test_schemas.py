"""Unit tests for Pydantic schemas."""

import pytest
from app.models.schemas import (
    InferenceRequest,
    InferenceResponse,
    InferenceResult,
    ModelInfo,
    JobStatus,
    InteractionType,
    OutputFormat,
)


class TestInferenceRequest:
    def test_valid_request(self):
        req = InferenceRequest(
            model_id="segmentation",
            study_uid="1.2.840.113704.1.111.13428.1678778829.1",
            series_uid="1.2.840.113704.1.111.13428.1678778829.1.1",
        )
        assert req.model_id == "segmentation"
        assert req.model_version == "latest"
        assert req.interaction_type == InteractionType.AUTO
        assert req.output_format == OutputFormat.NIFTI

    def test_custom_params(self):
        req = InferenceRequest(
            model_id="deepedit",
            model_version="v1.1.0",
            study_uid="1.2.3.4",
            series_uid="1.2.3.4.1",
            interaction_type=InteractionType.CLICKS,
            output_format=OutputFormat.DICOM_SEG,
            clicks=[{"x": 100, "y": 200, "z": 50, "label": "foreground"}],
        )
        assert req.interaction_type == InteractionType.CLICKS
        assert len(req.clicks) == 1


class TestInferenceResult:
    def test_completed_result(self):
        result = InferenceResult(
            job_id="job_001",
            status=JobStatus.COMPLETED,
            execution_time_ms=5234,
            artifact_id="art_001",
            download_url="http://minio/artifacts/art_001.nii.gz",
            labels=["liver"],
        )
        assert result.status == JobStatus.COMPLETED
        assert result.execution_time_ms == 5234

    def test_failed_result(self):
        result = InferenceResult(
            job_id="job_002",
            status=JobStatus.FAILED,
            error_message="MONAI Label server unavailable",
        )
        assert result.status == JobStatus.FAILED
        assert result.error_message is not None


class TestModelInfo:
    def test_model_info(self):
        model = ModelInfo(
            id="segmentation",
            name="segmentation",
            description="Multi-organ segmentation",
            model_type="segmentation",
            labels=["liver", "spleen", "kidney"],
        )
        assert len(model.labels) == 3
