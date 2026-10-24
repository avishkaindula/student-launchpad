"""Saving, loading and using the trained model.

A ModelBundle is the fitted scikit-learn Pipeline (preprocessing + model) plus
metadata describing it. Both go into ONE joblib file so they can never get out
of sync; the metadata is also written to metadata.json for humans and git.

Security: joblib/pickle files can run code when loaded. Only load model files
that you (or your teammates) created.
"""

import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import joblib
import pandas as pd
import sklearn
from sklearn.pipeline import Pipeline

from app.schemas import ModelMetadata, Prediction

logger = logging.getLogger(__name__)


@dataclass
class ModelBundle:
    pipeline: Pipeline
    metadata: ModelMetadata

    def predict(self, records: list[dict[str, Any]]) -> list[Prediction]:
        """Classify a list of records (dicts of feature name -> value)."""
        # Same columns, same order as training: never rely on dict order alone.
        features = pd.DataFrame(records, columns=self.metadata.feature_names)
        probabilities = self.pipeline.predict_proba(features)
        labels = [str(label) for label in self.pipeline.classes_]

        return [
            Prediction(
                label=labels[int(row.argmax())],
                probabilities={
                    label: round(float(p), 4)
                    for label, p in zip(labels, row, strict=True)
                },
            )
            for row in probabilities
        ]


def metadata_path(model_path: Path) -> Path:
    return model_path.with_name("metadata.json")


def save_bundle(bundle: ModelBundle, model_path: Path) -> None:
    model_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(
        {
            "pipeline": bundle.pipeline,
            "metadata": bundle.metadata.model_dump(mode="json"),
        },
        model_path,
    )
    metadata_path(model_path).write_text(bundle.metadata.model_dump_json(indent=2))


def load_bundle(model_path: Path) -> ModelBundle:
    """Load a bundle saved by save_bundle. Raises FileNotFoundError if missing."""
    # joblib uses pickle: safe here because we only load files we trained.
    data = joblib.load(model_path)
    metadata = ModelMetadata.model_validate(data["metadata"])

    if metadata.sklearn_version != sklearn.__version__:
        logger.warning(
            "Model was trained with scikit-learn %s but %s is installed. "
            "Predictions may differ; retrain to be safe.",
            metadata.sklearn_version,
            sklearn.__version__,
        )
    return ModelBundle(pipeline=data["pipeline"], metadata=metadata)
