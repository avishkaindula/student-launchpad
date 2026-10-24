"""Shared test fixtures.

Tests train their own model into a temporary folder, so they never depend on
(or overwrite) whatever is in models/.
"""

from collections.abc import Iterator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app
from training.train import train

FRONTEND_ORIGIN = "http://localhost:3000"


@pytest.fixture(scope="session")
def model_path(tmp_path_factory: pytest.TempPathFactory) -> Path:
    """Train once per test run and return the path of the saved model."""
    path = tmp_path_factory.mktemp("models") / "model.joblib"
    train(path)
    return path


def make_client(model_path: Path) -> TestClient:
    settings = Settings(
        model_path=model_path,
        cors_origins=[FRONTEND_ORIGIN],
        _env_file=None,  # ignore your local .env
    )
    return TestClient(create_app(settings))


@pytest.fixture
def client(model_path: Path) -> Iterator[TestClient]:
    with make_client(model_path) as test_client:  # `with` runs startup
        yield test_client


@pytest.fixture
def client_without_model(tmp_path: Path) -> Iterator[TestClient]:
    with make_client(tmp_path / "does-not-exist.joblib") as test_client:
        yield test_client
