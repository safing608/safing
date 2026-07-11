from fastapi import APIRouter, Depends

from app.schemas.agent import AgentRunRequest, AgentRunResponse
from app.services.orchestrator import AgentOrchestrator, get_agent_orchestrator

router = APIRouter()


@router.post("/run", response_model=AgentRunResponse)
async def run_agents(
    request: AgentRunRequest,
    orchestrator: AgentOrchestrator = Depends(get_agent_orchestrator),
) -> AgentRunResponse:
    return await orchestrator.run(request)

