from functools import lru_cache

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
