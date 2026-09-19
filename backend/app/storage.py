"""S3-compatible object storage boundary for imagery, rasters, and model artifacts."""
from io import BytesIO
from uuid import uuid4

from .config import get_settings


class ObjectStorage:
    def __init__(self) -> None:
        settings = get_settings()
        try:
            from minio import Minio
        except ImportError:
            self.client = None
            self.bucket = settings.object_store_bucket
            return
        self.bucket = settings.object_store_bucket
        self.client = Minio(
            settings.object_store_endpoint,
            access_key=settings.object_store_access_key,
            secret_key=settings.object_store_secret_key,
            secure=settings.object_store_secure,
        )

    def upload(self, filename: str, content: bytes, content_type: str | None) -> dict[str, str]:
        if self.client is None:
            raise RuntimeError("MinIO dependency is not installed")
        object_name = f"uploads/{uuid4()}-{filename.rsplit('/', 1)[-1].rsplit(chr(92), 1)[-1]}"
        if not self.client.bucket_exists(self.bucket):
            self.client.make_bucket(self.bucket)
        self.client.put_object(
            self.bucket,
            object_name,
            BytesIO(content),
            length=len(content),
            content_type=content_type or "application/octet-stream",
        )
        return {
            "bucket": self.bucket,
            "object_name": object_name,
            "url": self.client.presigned_get_object(self.bucket, object_name),
        }


object_storage = ObjectStorage()
