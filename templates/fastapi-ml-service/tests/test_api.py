import pytest
from fastapi.testclient import TestClient

from app.schemas import EXAMPLE_INPUT, MAX_BATCH_SIZE

FRONTEND_ORIGIN = "http://localhost:3000"  # allowed in conftest.make_client

FIRST_FIELD = next(iter(EXAMPLE_INPUT))

BAD_INPUTS = {
    "empty body": {},
    "missing field": {k: v for k, v in EXAMPLE_INPUT.items() if k != FIRST_FIELD},
    "wrong type": {**EXAMPLE_INPUT, FIRST_FIELD: ["not", "a", "value"]},
    "unknown field": {**EXAMPLE_INPUT, "unknown_field": 1},
}


def test_health(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["model_loaded"] is True


def test_model_metadata(client: TestClient) -> None:
    response = client.get("/model")
    assert response.status_code == 200
    body = response.json()
    assert body["feature_names"] == list(EXAMPLE_INPUT)
    assert "accuracy" in body["metrics"]


def test_predict(client: TestClient) -> None:
    response = client.post("/predict", json=EXAMPLE_INPUT)
    assert response.status_code == 200
    body = response.json()
    probabilities = body["probabilities"]
    assert body["label"] == max(probabilities, key=probabilities.get)
    assert sum(probabilities.values()) == pytest.approx(1.0, abs=1e-3)
    assert body["model_version"]


@pytest.mark.parametrize("payload", BAD_INPUTS.values(), ids=BAD_INPUTS.keys())
def test_predict_rejects_bad_input(client: TestClient, payload: dict) -> None:
    response = client.post("/predict", json=payload)
    assert response.status_code == 422
    assert response.json()["detail"]  # says which field is wrong


def test_predict_batch(client: TestClient) -> None:
    response = client.post("/predict/batch", json={"records": [EXAMPLE_INPUT] * 3})
    assert response.status_code == 200
    assert len(response.json()["predictions"]) == 3


def test_predict_batch_rejects_too_many_records(client: TestClient) -> None:
    records = [EXAMPLE_INPUT] * (MAX_BATCH_SIZE + 1)
    response = client.post("/predict/batch", json={"records": records})
    assert response.status_code == 422


def test_returns_503_when_no_model_is_trained(client_without_model: TestClient):
    assert client_without_model.get("/health").json()["model_loaded"] is False

    response = client_without_model.post("/predict", json=EXAMPLE_INPUT)
    assert response.status_code == 503
    assert "training.train" in response.json()["detail"]
    assert client_without_model.get("/model").status_code == 503


def test_cors_allows_the_frontend(client: TestClient) -> None:
    response = client.options(
        "/predict",
        headers={
            "Origin": FRONTEND_ORIGIN,
            "Access-Control-Request-Method": "POST",
        },
    )
    assert response.headers["access-control-allow-origin"] == FRONTEND_ORIGIN
