import io
import uuid
from typing import BinaryIO

import boto3
from botocore.client import Config as BotoConfig

from app.config import settings


class ArtifactStore:
    """MinIO/S3-compatible artifact storage for segmentation masks."""

    def __init__(self):
        self.client = boto3.client(
            "s3",
            endpoint_url=f"{'https' if settings.minio_use_ssl else 'http'}://{settings.minio_endpoint}",
            aws_access_key_id=settings.minio_access_key,
            aws_secret_access_key=settings.minio_secret_key,
            config=BotoConfig(signature_version="s3v4"),
            region_name="us-east-1",
        )
        self.bucket = settings.minio_bucket

    def ensure_bucket(self) -> None:
        try:
            self.client.head_bucket(Bucket=self.bucket)
        except Exception:
            self.client.create_bucket(Bucket=self.bucket)

    def store_artifact(
        self,
        data: bytes,
        artifact_type: str = "segmentation",
        file_extension: str = ".nii.gz",
        metadata: dict[str, str] | None = None,
    ) -> str:
        artifact_id = str(uuid.uuid4())
        key = f"artifacts/{artifact_type}/{artifact_id}{file_extension}"

        self.client.put_object(
            Bucket=self.bucket,
            Key=key,
            Body=io.BytesIO(data),
            ContentLength=len(data),
            Metadata=metadata or {},
        )

        return key

    def get_artifact(self, key: str) -> bytes:
        response = self.client.get_object(Bucket=self.bucket, Key=key)
        return response["Body"].read()

    def get_presigned_url(self, key: str, expires_in: int = 3600) -> str:
        return self.client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self.bucket, "Key": key},
            ExpiresIn=expires_in,
        )

    def delete_artifact(self, key: str) -> None:
        self.client.delete_object(Bucket=self.bucket, Key=key)

    def list_artifacts(self, prefix: str = "artifacts/") -> list[str]:
        response = self.client.list_objects_v2(Bucket=self.bucket, Prefix=prefix)
        return [obj["Key"] for obj in response.get("Contents", [])]
