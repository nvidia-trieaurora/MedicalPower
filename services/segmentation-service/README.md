# Segmentation Service

FastAPI service that orchestrates AI inference via MONAI Label and manages segmentation artifacts.

## Responsibilities

- Proxy inference requests to MONAI Label server
- Manage inference job lifecycle (queue, execute, store results)
- Store segmentation masks in MinIO (S3-compatible)
- Model registry and version management
- Training pipeline orchestration

## Local Development

```bash
cd services/segmentation-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 5000
```

## API Endpoints

- `POST /api/v1/inference` — Request AI segmentation
- `GET /api/v1/inference/{job_id}` — Poll inference status
- `GET /api/v1/models` — List available AI models
- `GET /api/v1/models/{model_id}` — Get model details
- `POST /api/v1/training/runs` — Start model training
- `GET /api/v1/training/status` — Get training status
- `GET /health` — Health check

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SEG_MONAI_LABEL_URL` | `http://monai-label:8000` | MONAI Label server URL |
| `SEG_MINIO_ENDPOINT` | `minio:9000` | MinIO endpoint |
| `SEG_MINIO_ACCESS_KEY` | `minioadmin` | MinIO access key |
| `SEG_MINIO_SECRET_KEY` | `minioadmin` | MinIO secret key |
| `SEG_MINIO_BUCKET` | `medicalpower-artifacts` | Artifact bucket name |
| `SEG_RABBITMQ_URL` | `amqp://...` | RabbitMQ connection URL |
