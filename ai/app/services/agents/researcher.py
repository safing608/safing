from app.services.agents.base import AgentContext, BaseAgent


class ResearcherAgent(BaseAgent):
    name = "researcher"

    async def run(self, context: AgentContext) -> str:
        plan = context.data.get("planner", "")
        return (
            f"작업: {context.task}\n"
            f"계획 기반 조사 요약:\n{plan}\n"
            "현재 예시는 외부 검색 대신 입력 context와 내부 규칙을 사용합니다."
        )

