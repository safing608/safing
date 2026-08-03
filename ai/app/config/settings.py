from functools import lru_cache

from pydantic import Field, field_validator

try:
    from pydantic_settings import BaseSettings, SettingsConfigDict
except ModuleNotFoundError:
    from pydantic import BaseModel as BaseSettings

    SettingsConfigDict = None


class Settings(BaseSettings):
    app_name: str = "SAFING API"
    app_version: str = "0.1.0"
    debug: bool = True
    default_agent_timeout_seconds: int = 30
    database_url: str = "postgresql+psycopg://safing:Safing%212026_Postgres@localhost:5432/safing"
    open_api_key: str | None = Field(default=None, validation_alias="OPEN_API_KEY")
    openai_risk_model: str = "gpt-5-mini"
    openai_safety_model: str = "gpt-5-nano"
    openai_api_base_url: str = "https://api.openai.com/v1"
    openai_timeout_seconds: float = 30.0

    @field_validator("debug", mode="before")
    @classmethod
    def parse_debug(cls, value: object) -> object:
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"release", "prod", "production"}:
                return False
            if normalized in {"dev", "development", "local"}:
                return True
        return value

    if SettingsConfigDict is not None:
        model_config = SettingsConfigDict(
            env_file=".env",
            env_file_encoding="utf-8",
            extra="ignore",
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
