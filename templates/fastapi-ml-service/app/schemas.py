"""Request and response shapes for the API.

FastAPI validates every request against these classes before your code runs,
so bad input gets a clear 422 error instead of crashing the model. The
descriptions and examples here are what you see on the /docs page.
"""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

MAX_BATCH_SIZE = 100  # protects the server from huge requests

# SWAP: one realistic row of YOUR dataset (features only, no target).
# It is the example on /docs and the input used by the tests.
EXAMPLE_INPUT = {
    "sepal_length": 5.1,
    "sepal_width": 3.5,
    "petal_length": 1.4,
    "petal_width": 0.2,
}


class PredictionInput(BaseModel):
    """One record to classify: a row of the training data without the target.

    SWAP: these fields must have the same names, in the same order, as the
    feature columns in training/train.py. The API refuses to start if they
    don't match the trained model. Use `str` for categorical columns.
    """

    model_config = ConfigDict(
        extra="forbid",  # reject unknown keys, e.g. typos from the frontend
        json_schema_extra={"examples": [EXAMPLE_INPUT]},
    )

    # gt/le bounds reject impossible values (negative or absurd measurements).
    sepal_length: float = Field(gt=0, le=50, description="Sepal length in cm.")
    sepal_width: float = Field(gt=0, le=50, description="Sepal width in cm.")
    petal_length: float = Field(gt=0, le=50, description="Petal length in cm.")
    petal_width: float = Field(gt=0, le=50, description="Petal width in cm.")


class BatchPredictionInput(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "records": [
                        EXAMPLE_INPUT,
                        {
                            "sepal_length": 6.7,
                            "sepal_width": 3.0,
                            "petal_length": 5.2,
                            "petal_width": 2.3,
                        },
                    ]
                }
            ]
        }
    )

    records: list[PredictionInput] = Field(
        min_length=1,
        max_length=MAX_BATCH_SIZE,
        description=f"Between 1 and {MAX_BATCH_SIZE} records to classify.",
    )


class Prediction(BaseModel):
    label: str = Field(description="The most likely class.", examples=["setosa"])
    probabilities: dict[str, float] = Field(
        description="Probability of every class (they add up to 1).",
        examples=[{"setosa": 0.98, "versicolor": 0.02, "virginica": 0.0}],
    )


class PredictionResponse(Prediction):
    model_version: str = Field(description="Version of the model that answered.")


class BatchPredictionResponse(BaseModel):
    predictions: list[Prediction] = Field(description="One result per record.")
    model_version: str = Field(description="Version of the model that answered.")


class ModelMetadata(BaseModel):
    """Everything worth knowing about a trained model.

    Saved inside the model file and as models/metadata.json, and served by
    GET /model so anyone can check exactly which model is running.
    """

    model_version: str = Field(description="Training time (UTC) + git commit.")
    trained_at: datetime
    model_type: str = Field(examples=["LogisticRegression"])
    dataset: str
    feature_names: list[str] = Field(description="Input columns, in order.")
    class_labels: list[str]
    metrics: dict[str, float] = Field(description="Scores on the held-out test set.")
    n_train: int = Field(description="Rows used for training.")
    n_test: int = Field(description="Rows used for evaluation.")
    random_state: int = Field(description="Seed used for the split and the model.")
    sklearn_version: str


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
    model_loaded: bool
    model_version: str | None = None
