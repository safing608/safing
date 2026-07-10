from fastapi import APIRouter

from app.api.v1 import chat

router = APIRouter()
router.include_router(chat.router, tags=["chat"])
