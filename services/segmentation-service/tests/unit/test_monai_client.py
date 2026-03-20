"""Unit tests for MONAI Label client."""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock

from app.services.monai_client import MONAILabelClient


@pytest.fixture
def client():
    return MONAILabelClient(base_url="http://localhost:8000", timeout=10)


class TestMONAILabelClient:
    """Tests for MONAILabelClient."""

    @pytest.mark.asyncio
    async def test_health_check_success(self, client):
        with patch("httpx.AsyncClient") as mock_client:
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_client.return_value.__aenter__ = AsyncMock(return_value=mock_client.return_value)
            mock_client.return_value.__aexit__ = AsyncMock(return_value=False)
            mock_client.return_value.get = AsyncMock(return_value=mock_response)

            result = await client.health_check()
            assert result is True

    @pytest.mark.asyncio
    async def test_health_check_failure(self, client):
        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__ = AsyncMock(return_value=mock_client.return_value)
            mock_client.return_value.__aexit__ = AsyncMock(return_value=False)
            mock_client.return_value.get = AsyncMock(side_effect=Exception("Connection refused"))

            result = await client.health_check()
            assert result is False

    @pytest.mark.asyncio
    async def test_get_info(self, client):
        mock_info = {
            "name": "radiology",
            "models": {"segmentation": {"type": "segmentation"}},
            "version": "0.8.5",
        }

        with patch("httpx.AsyncClient") as mock_client:
            mock_response = MagicMock()
            mock_response.json.return_value = mock_info
            mock_response.raise_for_status = MagicMock()
            mock_client.return_value.__aenter__ = AsyncMock(return_value=mock_client.return_value)
            mock_client.return_value.__aexit__ = AsyncMock(return_value=False)
            mock_client.return_value.get = AsyncMock(return_value=mock_response)

            result = await client.get_info()
            assert result["name"] == "radiology"
            assert "segmentation" in result["models"]

    @pytest.mark.asyncio
    async def test_get_models(self, client):
        mock_info = {
            "models": {
                "segmentation": {"type": "segmentation", "labels": ["liver", "spleen"]},
                "deepedit": {"type": "deepedit", "labels": ["liver"]},
            }
        }

        with patch("httpx.AsyncClient") as mock_client:
            mock_response = MagicMock()
            mock_response.json.return_value = mock_info
            mock_response.raise_for_status = MagicMock()
            mock_client.return_value.__aenter__ = AsyncMock(return_value=mock_client.return_value)
            mock_client.return_value.__aexit__ = AsyncMock(return_value=False)
            mock_client.return_value.get = AsyncMock(return_value=mock_response)

            result = await client.get_models()
            assert len(result) == 2
            assert "segmentation" in result
            assert "deepedit" in result
