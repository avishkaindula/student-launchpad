"""The API: load the model once at startup, then serve predictions.

Run locally:  uv run fastapi dev app/main.py   then open http://127.0.0.1:8000/docs
"""

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.config import Settings, get_settings
from app.model import ModelBundle, load_bundle
from app.schemas import (
    BatchPredictionInput,
    BatchPredictionResponse,
    HealthResponse,
    ModelMetadata,
    PredictionInput,
    PredictionResponse,
)

logging.basicConfig(level=logging.INFO, format="%(levelname)s:     %(message)s")
logger = logging.getLogger(__name__)

NO_MODEL_MESSAGE = (
    "No trained model is loaded. Run `uv run python -m training.train`, "
    "then restart the API."
)


def load_model_or_none(model_path: Path) -> ModelBundle | None:
    """Load the model at startup. A missing model is allowed (endpoints return
    503); a model that doesn't match the API schema is a bug, so we fail loudly."""
    try:
        bundle = load_bundle(model_path)
    except FileNotFoundError:
        logger.warning("%s (looked for %s)", NO_MODEL_MESSAGE, model_path)
        return None

    expected = list(PredictionInput.model_fields)
    if bundle.metadata.feature_names != expected:
        raise RuntimeError(
            f"The model was trained on features {bundle.metadata.feature_names}, "
            f"but PredictionInput in app/schemas.py has {expected}. "
            "Make them match, then retrain."
        )
    logger.info("Loaded model %s from %s", bundle.metadata.model_version, model_path)
    return bundle


def get_bundle(request: Request) -> ModelBundle:
    """Dependency: hands the loaded model to an endpoint, or answers 503."""
    bundle: ModelBundle | None = request.app.state.bundle
    if bundle is None:
        raise HTTPException(status_code=503, detail=NO_MODEL_MESSAGE)
    return bundle


LoadedModel = Annotated[ModelBundle, Depends(get_bundle)]
NO_MODEL_RESPONSE = {503: {"description": "No model has been trained yet."}}

router = APIRouter()


@router.get("/", include_in_schema=False)
def index() -> RedirectResponse:
    return RedirectResponse(url="/docs")


@router.get("/health", tags=["service"])
def health(request: Request) -> HealthResponse:
    """Is the server up, and is a model loaded? Use this for uptime checks."""
    bundle: ModelBundle | None = request.app.state.bundle
    return HealthResponse(
        model_loaded=bundle is not None,
        model_version=bundle.metadata.model_version if bundle else None,
    )


@router.get("/model", tags=["model"], responses=NO_MODEL_RESPONSE)
def model_info(bundle: LoadedModel) -> ModelMetadata:
    """Which model is running: version, training date, metrics and features."""
    return bundle.metadata


# Plain `def` (not `async def`): FastAPI runs these in a thread pool, so a slow
# model doesn't freeze the whole server while it computes.
@router.post("/predict", tags=["model"], responses=NO_MODEL_RESPONSE)
def predict(record: PredictionInput, bundle: LoadedModel) -> PredictionResponse:
    """Classify a single record."""
    [prediction] = bundle.predict([record.model_dump()])
    return PredictionResponse(
        **prediction.model_dump(), model_version=bundle.metadata.model_version
    )


@router.post("/predict/batch", tags=["model"], responses=NO_MODEL_RESPONSE)
def predict_batch(
    batch: BatchPredictionInput, bundle: LoadedModel
) -> BatchPredictionResponse:
    """Classify several records in one request (faster than many single calls)."""
    predictions = bundle.predict([record.model_dump() for record in batch.records])
    return BatchPredictionResponse(
        predictions=predictions, model_version=bundle.metadata.model_version
    )


def create_app(settings: Settings | None = None) -> FastAPI:
    """Build the app. Tests call this with their own settings."""
    settings = settings or get_settings()

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        # Runs once when the server starts: load the model into memory here,
        # never inside an endpoint (that would reload it on every request).
        app.state.bundle = load_model_or_none(settings.model_path)
        yield
        app.state.bundle = None

    app = FastAPI(
        title="DSGP Model API",
        description="Predictions from a scikit-learn model. Try the endpoints below.",
        version="0.1.0",
        lifespan=lifespan,
    )
    # Lets browser frontends on these origins call the API.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
    )
    app.include_router(router)
    return app


app = create_app()
