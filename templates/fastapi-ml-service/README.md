# FastAPI ML Service

A small starter for Data Science Group Projects: **train a model, serve it as an API, test it, ship it.**

You probably already train models in notebooks. This template shows the next step: turning that model into a web service your frontend (or anyone) can call, with tests and a Docker image, using habits that will save your team time later.

Out of the box it trains a scikit-learn classifier on the Iris dataset (bundled with scikit-learn, so no download needed) and serves predictions with FastAPI. Replace the data and the model with your own; the structure stays the same.

**Stack:** Python 3.12 · [uv](https://docs.astral.sh/uv/) · FastAPI · pydantic v2 · scikit-learn · pandas · pytest · ruff · Docker

---

## Quickstart

**1. Install uv** (it installs the right Python for you, so you don't need Python 3.12 already):

```bash
# macOS / Linux
curl -LsSf https://astral.sh/uv/install.sh | sh
# Windows (PowerShell)
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

**2. Install, train, run.** Run these from this folder:

```bash
uv sync                            # Python 3.12 + all dependencies into .venv/
uv run python -m training.train    # trains, prints metrics, saves models/model.joblib
uv run fastapi dev app/main.py     # starts the API with auto-reload
```

**3. Open <http://127.0.0.1:8000/docs>**, pick `POST /predict`, click **Try it out → Execute**. The example input is already filled in.

Or from a terminal (on Windows PowerShell, type `curl.exe` instead of `curl`):

```bash
curl -X POST http://127.0.0.1:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"sepal_length": 5.1, "sepal_width": 3.5, "petal_length": 1.4, "petal_width": 0.2}'
```

```json
{"label": "setosa", "probabilities": {"setosa": 0.9808, "versicolor": 0.0192, "virginica": 0.0}, "model_version": "20261024-031334"}
```

Have `make`? `make install`, `make train`, `make dev`, `make test` and `make lint` do the same (see the `Makefile`).

## Endpoints

| Method | Path             | What it does                                                             |
| ------ | ---------------- | ------------------------------------------------------------------------ |
| GET    | `/health`        | Is the server up, and is a model loaded? (always 200; for uptime checks) |
| GET    | `/model`         | Which model is running: version, trained_at, metrics, features, classes  |
| POST   | `/predict`       | Classify one record                                                      |
| POST   | `/predict/batch` | Classify up to 100 records: `{"records": [ ... ]}`                       |
| GET    | `/docs`          | Interactive documentation (generated from `app/schemas.py`)             |

Status codes you will see: **422** means the input failed validation (the response says which field and why); **503** means no model has been trained yet.

## Project structure

```text
fastapi-ml-service/
├── app/
│   ├── main.py        # FastAPI app: endpoints, loads the model once at startup, CORS
│   ├── schemas.py     # request/response shapes + validation rules (what /docs shows)
│   ├── model.py       # ModelBundle (pipeline + metadata), save/load, predict
│   └── config.py      # settings from environment variables / .env
├── training/
│   └── train.py       # load data → split → Pipeline → metrics → save model
├── tests/             # pytest: training sanity + API behaviour
├── notebooks/         # exploration only (see notebooks/README.md)
├── models/            # model.joblib (git-ignored) + metadata.json (commit it)
├── Dockerfile         # production image: installs, trains, runs as non-root
├── pyproject.toml     # dependencies and tool settings
├── uv.lock            # exact versions, so every teammate gets the same setup
└── .env.example       # copy to .env to change settings locally
```

How a prediction flows: request JSON → validated by `PredictionInput` (`schemas.py`) → turned into a one-row DataFrame with the training columns → the saved scikit-learn `Pipeline` runs preprocessing + model → response JSON.

## Make it yours

### Swap in your dataset

1. Put your CSV in `data/` (large or private files in `data/raw/`, which git ignores).
2. In `training/train.py`, find **SWAP YOUR DATA HERE**:
   - list your columns in `NUMERIC_FEATURES` and `CATEGORICAL_FEATURES`,
   - in `load_data()`, delete Option A and uncomment Option B (`pd.read_csv(...)`), setting your target column.
3. In `app/schemas.py`, update `PredictionInput` so its fields match your feature columns (same names, same order; `float`/`int` for numbers, `str` for categories) and update `EXAMPLE_INPUT` with a realistic row. The API refuses to start if the schema and the trained model disagree, so mistakes show up immediately.
4. Retrain (`uv run python -m training.train`), restart the server, and run `uv run pytest`. Adjust `MIN_ACCURACY` in `tests/test_training.py` to a floor that makes sense for your problem.

The pipeline already fills missing values and one-hot encodes categorical columns, so messy real-world CSVs work without extra code.

### Swap the model

Change the `model = ...` line in `build_pipeline()` (marked **SWAP YOUR MODEL HERE**), e.g. `RandomForestClassifier(n_estimators=200, random_state=RANDOM_STATE)`. Any classifier with `predict_proba()` works. Need another library? `uv add xgboost` (not `pip install`) so it lands in `pyproject.toml` and `uv.lock` for your whole team.

**Regression instead of classification?** Use a regressor, return a number from `ModelBundle.predict()` (call `pipeline.predict` instead of `predict_proba`), change `Prediction` in `schemas.py` to something like `value: float`, and report metrics such as MAE/RMSE in `train.py`.

## Calling the API from a frontend

Browsers block calls to another origin unless the API allows it (CORS). Add your frontend's URL to `CORS_ORIGINS` (in `.env` locally, or as an environment variable on your host). Defaults allow `http://localhost:3000` (Next.js) and `http://localhost:5173` (Vite).

```ts
// Next.js: NEXT_PUBLIC_API_URL; Vite: import.meta.env.VITE_API_URL
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type PredictionResponse = {
  label: string;
  probabilities: Record<string, number>;
  model_version: string;
};

export async function predict(input: Record<string, number | string>): Promise<PredictionResponse> {
  const res = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    // 422: invalid input (`detail` lists each bad field); 503: no model loaded
    const body = await res.json();
    throw new Error(`API error ${res.status}: ${JSON.stringify(body.detail)}`);
  }
  return res.json();
}

// const result = await predict({ sepal_length: 5.1, sepal_width: 3.5, petal_length: 1.4, petal_width: 0.2 });
```

## Configuration

Settings come from environment variables, or from a `.env` file locally (`cp .env.example .env`). Never commit `.env`.

| Variable       | Default                                         | Meaning                                                     |
| -------------- | ----------------------------------------------- | ----------------------------------------------------------- |
| `MODEL_PATH`   | `models/model.joblib`                           | Where training saves the model and the API loads it from.   |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:5173`   | Comma-separated frontend URLs allowed to call the API.      |

## Testing and linting

```bash
uv run pytest                  # trains a fresh model in a temp folder, then tests it and the API
uv run ruff check .            # finds bugs and bad patterns
uv run ruff format .           # formats code (use --check in CI)
```

The tests check that training beats a sanity accuracy floor and the "always guess the most common class" baseline, that the API schema matches the model's features, and that `/health`, `/model`, `/predict` and `/predict/batch` behave, including 422 on bad input and 503 when no model exists. When you fix a bug, add a test that would have caught it.

## Deploying

The `Dockerfile` installs dependencies with uv, **trains the model during the build**, and runs the API as a non-root user on `$PORT` (default 8000).

```bash
docker build -t fastapi-ml-service .
docker run --rm -p 8000:8000 fastapi-ml-service    # then open http://localhost:8000/docs
```

Why train at build time: the seed is fixed so the result is reproducible, and the image carries its own model, so it runs on any host with no volumes or upload step. It stops fitting when training takes more than a few minutes, or when your data can't be in the repo. Then train on your machine (or Colab), and change the Dockerfile to copy the model in: delete the `RUN .venv/bin/python -m training.train` line and remove the two `models/` lines from `.dockerignore` (the model then needs to be available wherever the image is built, e.g. downloaded in CI rather than committed if it's large).

Hosts that build straight from your GitHub repo using the Dockerfile:

- **Render**: New → Web Service → pick the repo (Docker is detected). Set the Health Check Path to `/health` and add `CORS_ORIGINS`. Render provides `PORT`. Free instances sleep when idle, so the first request after a break is slow.
- **Railway**: New Project → Deploy from GitHub repo, add `CORS_ORIGINS`, then generate a public domain. Railway provides `PORT`.
- **Fly.io**: `fly launch` (detects the Dockerfile; use internal port 8000), then `fly deploy`.

If this template lives in a subfolder of your repo, set that folder as the service's root directory. After deploying, open `https://<your-app>/model` to confirm which model version is live.

FastAPI also runs on **Vercel** as a serverless Python function. It can work for small models, but scikit-learn and pandas make a large bundle, the model file has to exist at deploy time, and each cold start reloads it, so a Docker host is the simpler choice for this template.

## Notebook → service habits

- **Fix your seeds** (`RANDOM_STATE`) so a teammate re-running training gets the same split and the same model.
- **Put preprocessing inside the Pipeline.** Scaling or encoding done by hand in a notebook is easy to forget at prediction time; a Pipeline is saved and loaded as one object.
- **Save metadata with every model**: metrics, feature names, class labels, library versions, training time. `GET /model` serves it, so you can always tell what's deployed.
- **Version your model.** `model_version` is the UTC training time plus the git commit, so every model points back to the code that made it. Commit `models/metadata.json` as a record; keep the `.joblib` out of git.
- **Compare against a baseline.** 93% accuracy means little until you know that always guessing the majority class scores 33%.
- **Don't commit large data or model files.** Share them through Drive/OneDrive or release assets; git is for code.
- **Lock dependencies.** Add packages with `uv add`, commit `uv.lock`, and everyone (including Docker) gets identical versions.
- **Validate inputs at the edge.** Ranges and types in `schemas.py` reject garbage before it reaches the model.

## Common pitfalls

- **503 "No trained model is loaded"**: run `uv run python -m training.train`, then restart the server. The dev server reloads on code changes, not when the model file changes.
- **Commands fail with "No module named app" or can't find the model**: run everything from this project folder, not from inside `app/` or `notebooks/`.
- **422 Unprocessable Entity**: your JSON doesn't match `PredictionInput`. Read `detail`; it names the field (missing, wrong type, out of range, or an unknown key such as a typo).
- **CORS error in the browser console**: the frontend's exact origin (scheme + host + port, no trailing slash) must be in `CORS_ORIGINS`.
- **API won't start: "The model was trained on features ..."**: you changed the dataset or the schema but not both. Make `PredictionInput` match the training columns and retrain.
- **"Model was trained with scikit-learn X but Y is installed"**: models saved with one scikit-learn version may behave differently in another. Retrain after upgrading.
- **`AttributeError: ... has no attribute 'predict_proba'`**: your new model can't output probabilities (e.g. `SVC()`). Wrap it as `CalibratedClassifierCV(SVC(), ensemble=False)` or pick a classifier that has `predict_proba`.
- **Port 8000 already in use**: another server is still running. Stop it, or use `uv run fastapi dev app/main.py --port 8001`.
- **Never load model files from strangers.** `.joblib`/pickle files can run code when loaded.
