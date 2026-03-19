from typing import Any

import httpx

from app.config import settings


class MONAILabelClient:
    """HTTP client wrapping the MONAI Label REST API."""

    def __init__(self, base_url: str | None = None, timeout: int | None = None):
        self.base_url = (base_url or settings.monai_label_url).rstrip("/")
        self.timeout = timeout or settings.monai_label_timeout

    async def get_info(self) -> dict[str, Any]:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(f"{self.base_url}/info/")
            response.raise_for_status()
            return response.json()

    async def get_models(self) -> dict[str, Any]:
        info = await self.get_info()
        return info.get("models", {})

    async def infer(
        self,
        model: str,
        image_id: str,
        params: dict[str, Any] | None = None,
        label: bytes | None = None,
        session_id: str | None = None,
    ) -> bytes:
        data: dict[str, Any] = {"model": model, "image": image_id}
        if params:
            data["params"] = params
        if session_id:
            data["session_id"] = session_id

        files: dict[str, Any] = {}
        if label:
            files["label"] = ("label.nii.gz", label, "application/octet-stream")

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            if files:
                response = await client.post(
                    f"{self.base_url}/infer/{model}",
                    data={"params": str(data.get("params", {}))},
                    files=files,
                    params={"image": image_id},
                )
            else:
                response = await client.post(
                    f"{self.base_url}/infer/{model}",
                    params={"image": image_id},
                    json=params or {},
                )
            response.raise_for_status()
            return response.content

    async def save_label(
        self,
        image_id: str,
        label_data: bytes,
        tag: str = "",
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        files = {"label": ("label.nii.gz", label_data, "application/octet-stream")}
        data: dict[str, str] = {"image": image_id}
        if tag:
            data["tag"] = tag

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.put(
                f"{self.base_url}/datastore/label",
                data=data,
                files=files,
                params={"image": image_id},
            )
            response.raise_for_status()
            return response.json()

    async def next_sample(self, strategy: str = "random") -> dict[str, Any]:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/activelearning/{strategy}",
            )
            response.raise_for_status()
            return response.json()

    async def train_start(
        self, model: str, params: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/train/{model}",
                json=params or {},
            )
            response.raise_for_status()
            return response.json()

    async def train_status(self) -> dict[str, Any]:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(f"{self.base_url}/train/")
            response.raise_for_status()
            return response.json()

    async def health_check(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                response = await client.get(f"{self.base_url}/info/")
                return response.status_code == 200
        except Exception:
            return False
