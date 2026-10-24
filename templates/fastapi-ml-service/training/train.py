"""Train the model and save it for the API.

    uv run python -m training.train
    uv run python -m training.train --output models/experiment.joblib

Everything that turns raw columns into a prediction (filling gaps, scaling,
encoding categories, the model itself) lives in ONE scikit-learn Pipeline.
The API loads that same pipeline, so preprocessing at prediction time is
guaranteed to match training.
"""

import argparse
import subprocess
from datetime import UTC, datetime
from pathlib import Path

import pandas as pd
import sklearn
from sklearn.compose import ColumnTransformer
from sklearn.datasets import load_iris
from sklearn.dummy import DummyClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, f1_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from app.config import get_settings
from app.model import ModelBundle, save_bundle
from app.schemas import ModelMetadata

RANDOM_STATE = 42  # fixed seed: same split and same model on every run
TEST_SIZE = 0.2  # 20% of rows are held back to measure the model honestly

# =============================================================================
# SWAP YOUR DATA HERE
# 1. List your feature columns below (numeric and categorical).
# 2. Edit load_data() to read your data (see "Option B").
# 3. Make PredictionInput and EXAMPLE_INPUT in app/schemas.py match.
# =============================================================================
DATASET_NAME = "sklearn.datasets.load_iris"
NUMERIC_FEATURES = ["sepal_length", "sepal_width", "petal_length", "petal_width"]
CATEGORICAL_FEATURES: list[str] = []  # e.g. ["district", "payment_method"]
FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES


def load_data() -> tuple[pd.DataFrame, pd.Series]:
    """Return (X, y): the feature columns and the target labels."""
    # --- Option A (default): Iris, bundled with scikit-learn, works offline ---
    iris = load_iris(as_frame=True)
    X = iris.data.set_axis(NUMERIC_FEATURES, axis=1)  # tidy column names
    y = iris.target.map(dict(enumerate(iris.target_names)))  # 0 -> "setosa"

    # --- Option B: your own CSV. Delete Option A and uncomment this. ---
    # df = pd.read_csv("data/your_data.csv")
    # df = df.dropna(subset=["your_target_column"])  # unlabeled rows are useless
    # X = df[FEATURES]
    # y = df["your_target_column"].astype(str)

    return X[FEATURES], y


def build_pipeline() -> Pipeline:
    numeric = Pipeline(
        [
            ("impute", SimpleImputer(strategy="median")),  # fill missing numbers
            ("scale", StandardScaler()),
        ]
    )
    categorical = Pipeline(
        [
            ("impute", SimpleImputer(strategy="most_frequent")),
            # handle_unknown="ignore": a category never seen in training
            # won't crash the API at prediction time.
            ("onehot", OneHotEncoder(handle_unknown="ignore")),
        ]
    )
    preprocess = ColumnTransformer(
        [
            ("numeric", numeric, NUMERIC_FEATURES),
            ("categorical", categorical, CATEGORICAL_FEATURES),
        ]
    )
    # SWAP YOUR MODEL HERE. Any classifier with predict_proba() works, e.g.
    # RandomForestClassifier(n_estimators=200, random_state=RANDOM_STATE)
    model = LogisticRegression(max_iter=1000, random_state=RANDOM_STATE)
    return Pipeline([("preprocess", preprocess), ("model", model)])


def make_version(trained_at: datetime) -> str:
    """e.g. '20261024-153000-a1b2c3d': UTC time, plus the git commit if any.

    Sorts by date, has no spaces, and tells you which code produced the model.
    """
    version = trained_at.strftime("%Y%m%d-%H%M%S")
    try:
        commit = subprocess.run(
            ["git", "rev-parse", "--short", "HEAD"],
            capture_output=True,
            text=True,
            check=True,
            timeout=5,
        ).stdout.strip()
    except (OSError, subprocess.SubprocessError):  # no git, or not a repo
        return version
    return f"{version}-{commit}"


def train(output_path: Path) -> ModelMetadata:
    """Train, evaluate, save to `output_path`, and return the metadata."""
    X, y = load_data()
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )

    pipeline = build_pipeline()
    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)

    # A model is only "good" compared to something: here, always guessing
    # the most common class.
    baseline = DummyClassifier(strategy="most_frequent").fit(X_train, y_train)

    metrics = {
        "accuracy": accuracy_score(y_test, y_pred),
        "f1_macro": f1_score(y_test, y_pred, average="macro"),
        "baseline_accuracy": accuracy_score(y_test, baseline.predict(X_test)),
    }
    print(classification_report(y_test, y_pred))

    trained_at = datetime.now(UTC)
    metadata = ModelMetadata(
        model_version=make_version(trained_at),
        trained_at=trained_at,
        model_type=type(pipeline.named_steps["model"]).__name__,
        dataset=DATASET_NAME,
        feature_names=FEATURES,
        class_labels=[str(label) for label in pipeline.classes_],
        metrics={name: round(float(value), 4) for name, value in metrics.items()},
        n_train=len(X_train),
        n_test=len(X_test),
        random_state=RANDOM_STATE,
        sklearn_version=sklearn.__version__,
    )
    save_bundle(ModelBundle(pipeline=pipeline, metadata=metadata), output_path)
    return metadata


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument(
        "--output",
        type=Path,
        default=get_settings().model_path,
        help="where to save the model (default: MODEL_PATH setting)",
    )
    args = parser.parse_args()

    metadata = train(args.output)
    print(f"Model {metadata.model_version} saved to {args.output}")
    for name, value in metadata.metrics.items():
        print(f"  {name:<18} {value:.4f}")


if __name__ == "__main__":
    main()
