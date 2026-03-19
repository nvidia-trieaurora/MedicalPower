from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.inference import router as inference_router
from app.api.models import router as models_router
from app.api.training import router as training_router
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"Starting {settings.app_name}")
    print(f"MONAI Label server: {settings.monai_label_url}")
    print(f"MinIO endpoint: {settings.minio_endpoint}")
    yield
    print(f"Shutting down {settings.app_name}")


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(inference_router, prefix="/api/v1")
app.include_router(models_router, prefix="/api/v1")
app.include_router(training_router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok", "service": settings.app_name}


@app.get("/health/ready")
async def ready():
    return {"status": "ready"}
