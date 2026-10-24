# Shortcuts for the commands in the README.
# No `make` (e.g. on Windows)? Run the command under each target directly.

IMAGE ?= fastapi-ml-service

.PHONY: install train dev serve test lint format docker-build docker-run

install:       # install Python 3.12 + all dependencies into .venv
	uv sync

train:         # train the model -> models/model.joblib + models/metadata.json
	uv run python -m training.train

dev:           # local server with auto-reload -> http://127.0.0.1:8000/docs
	uv run fastapi dev app/main.py

serve:         # production-style server (no reload)
	uv run uvicorn app.main:app --host 0.0.0.0 --port 8000

test:
	uv run pytest

lint:          # what CI should run
	uv run ruff check .
	uv run ruff format --check .

format:        # auto-fix what can be fixed
	uv run ruff check --fix .
	uv run ruff format .

docker-build:
	docker build -t $(IMAGE) .

docker-run:
	docker run --rm -p 8000:8000 $(IMAGE)
