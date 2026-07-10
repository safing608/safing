from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from app.schemas.chat import ChatRequest
from app.workflows.safety_chat_workflow import SafetyChatWorkflow, get_safety_chat_workflow

router = APIRouter()


@router.post("/chat")
async def chat(
    request: ChatRequest,
    workflow: SafetyChatWorkflow = Depends(get_safety_chat_workflow),
) -> StreamingResponse:
    return StreamingResponse(
        workflow.stream(request),
        media_type="text/event-stream",
    )
