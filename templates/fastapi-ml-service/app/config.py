"""App settings, read from environment variables (and a local `.env` file).

Keeping configuration here (instead of hard-coding paths and URLs) means the
same code runs on your laptop, in tests and in production; only the
environment changes. See `.env.example` for the available variables.
"""

from functools import lru_cache
from pathlib import Path
from typing import Annotated

from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Where training saves the model bundle and where the API loads it from.
    # `metadata.json` is written next to it.
    model_path: Path = Path("models/model.joblib")

    # Browser origins allowed to call the API (your React / Next.js frontend).
    # In .env write them comma-separated: CORS_ORIGINS=http://a.com,http://b.com
    cors_origins: Annotated[list[str], NoDecode] = [
        "http://localhost:3000",  # Next.js / Create React App
        "http://localhost:5173",  # Vite
    ]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_commas(cls, value: object) -> object:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    """Read settings once and reuse them."""
    return Settings()
