import json
from pathlib import Path

from app.model import load_bundle, metadata_path
from app.schemas import EXAMPLE_INPUT, PredictionInput

# A sanity floor, not a goal: it catches a broken pipeline (shuffled labels,
# dropped columns...). SWAP: pick a floor that makes sense for your problem.
MIN_ACCURACY = 0.85


def test_training_saves_model_and_metadata(model_path: Path) -> None:
    assert model_path.exists()
    metadata = json.loads(metadata_path(model_path).read_text())
    assert metadata["model_version"]
    assert metadata["sklearn_version"]


def test_model_is_accurate_enough(model_path: Path) -> None:
    metrics = load_bundle(model_path).metadata.metrics
    assert metrics["accuracy"] >= MIN_ACCURACY
    assert metrics["accuracy"] > metrics["baseline_accuracy"]


def test_model_features_match_api_schema(model_path: Path) -> None:
    # If this fails, update PredictionInput in app/schemas.py (or train.py).
    feature_names = load_bundle(model_path).metadata.feature_names
    assert feature_names == list(PredictionInput.model_fields)


def test_saved_model_can_predict(model_path: Path) -> None:
    bundle = load_bundle(model_path)
    [prediction] = bundle.predict([EXAMPLE_INPUT])
    assert prediction.label in bundle.metadata.class_labels
