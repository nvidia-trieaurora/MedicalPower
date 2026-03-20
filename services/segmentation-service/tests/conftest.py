"""Shared test configuration and fixtures for segmentation-service."""

import pytest


@pytest.fixture
def sample_study_uid():
    return "1.2.840.113704.1.111.13428.1678778829.1"


@pytest.fixture
def sample_series_uid():
    return "1.2.840.113704.1.111.13428.1678778829.1.1"


@pytest.fixture
def sample_inference_params():
    return {
        "model_id": "segmentation",
        "model_version": "latest",
        "study_uid": "1.2.840.113704.1.111.13428.1678778829.1",
        "series_uid": "1.2.840.113704.1.111.13428.1678778829.1.1",
        "params": {},
    }
