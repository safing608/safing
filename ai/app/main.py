from fastapi import FastAPI

from app.config.settings import settings
from app.routers import agents, health


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        debug=settings.debug,
    )

    app.include_router(health.router)
    app.include_router(agents.router, prefix="/agents", tags=["agents"])

    return app


app = create_app()

