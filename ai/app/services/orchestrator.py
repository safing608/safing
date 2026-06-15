from functools import lru_cache

from app.schemas.agent import AgentRunRequest, AgentRunResponse, AgentStepResult
from app.services.agents.base import AgentContext
from app.services.agents.planner import PlannerAgent
from app.services.agents.researcher import ResearcherAgent
from app.services.agents.writer import WriterAgent


class AgentOrchestrator:
    def __init__(self) -> None:
        self.agents = [
            PlannerAgent(),
            ResearcherAgent(),
            WriterAgent(),
        ]

    async def run(self, request: AgentRunRequest) -> AgentRunResponse:
        context = AgentContext(task=request.task, data=dict(request.context))
        steps: list[AgentStepResult] = []

        for agent in self.agents:
            output = await agent.run(context)
            context.data[agent.name] = output
            steps.append(AgentStepResult(agent=agent.name, output=output))

        return AgentRunResponse(
            task=request.task,
            final_answer=steps[-1].output,
            steps=steps,
        )


@lru_cache
def get_agent_orchestrator() -> AgentOrchestrator:
    return AgentOrchestrator()

