from app.services.agents.base import AgentContext, BaseAgent


class WriterAgent(BaseAgent):
    name = "writer"

    async def run(self, context: AgentContext) -> str:
        research = context.data.get("researcher", "")
        return (
            "최종 답변 초안입니다.\n\n"
            f"{research}\n\n"
            "실제 LLM 연동 시 이 Agent에서 모델 호출 또는 LangGraph 노드 실행을 연결하면 됩니다."
        )

