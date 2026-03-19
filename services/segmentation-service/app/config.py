from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "MedicalPower Segmentation Service"
    debug: bool = False

    monai_label_url: str = "http://monai-label:8000"
    monai_label_timeout: int = 60

    minio_endpoint: str = "minio:9000"
    minio_access_key: str = "minioadmin"
    minio_secret_key: str = "minioadmin"
    minio_bucket: str = "medicalpower-artifacts"
    minio_use_ssl: bool = False

    rabbitmq_url: str = "amqp://mp_user:mp_pass@rabbitmq:5672/"

    orthanc_url: str = "http://orthanc:8042"
    orthanc_dicomweb_url: str = "http://orthanc:8042/dicom-web"

    max_concurrent_jobs: int = 4

    class Config:
        env_file = ".env"
        env_prefix = "SEG_"


settings = Settings()
