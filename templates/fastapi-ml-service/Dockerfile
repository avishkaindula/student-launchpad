# syntax=docker/dockerfile:1
# Two stages: "builder" installs dependencies and trains the model; the final
# image copies only the results, so it stays small and has no build tools.

# ---- Stage 1: install + train ----------------------------------------------
FROM ghcr.io/astral-sh/uv:0.10.9-python3.12-trixie-slim AS builder

# Precompile .pyc files (faster startup), copy files out of uv's cache
# instead of linking, and use the image's Python rather than downloading one.
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy UV_PYTHON_DOWNLOADS=0

WORKDIR /app

# Dependencies first: this layer is cached and only re-runs when uv.lock or
# pyproject.toml change, so code edits rebuild in seconds.
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --locked --no-dev --no-install-project

COPY . .

# Train inside the image. The fixed seed makes this reproducible, and the
# image ships with its own model, so it runs on any host without volumes.
# (Training takes hours, or the data can't go in the image? Train outside,
# then COPY models/ in instead: see "Deploying" in the README.)
RUN .venv/bin/python -m training.train

# ---- Stage 2: runtime --------------------------------------------------------
FROM python:3.12-slim-trixie

# Never run a web server as root.
RUN groupadd --system app && useradd --system --gid app --no-create-home app

WORKDIR /app
# Files stay owned by root: the app user can read them but not change them.
COPY --from=builder /app /app

ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PORT=8000

USER app
EXPOSE 8000

# Shell form so ${PORT} is filled in at start-up (Render/Railway set PORT).
CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
