from app.services.agents.base import AgentContext, BaseAgent


class PlannerAgent(BaseAgent):
    name = "planner"

    async def run(self, context: AgentContext) -> str:
        return (
            "1. 요청을 핵심 목표로 분해합니다.\n"
            "2. 필요한 정보와 제약사항을 정리합니다.\n"
            "3. 조사 결과를 바탕으로 최종 답변을 작성합니다."
        )

