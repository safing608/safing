from collections.abc import AsyncIterator
from functools import lru_cache

from app.agents.rag_searcher import RagSearchAgent
from app.agents.risk_classifier import RiskClassificationAgent
from app.agents.safety_responder import SafetyResponseAgent
from app.rag.accident_code_loader import AccidentCodeLoader
from app.schemas.chat import ChatRequest, SafetyChatState
from app.schemas.sse import (
    DoneEvent,
    FinalAnswerEvent,
    RiskClassificationEvent,
    SafetyStepEvent,
    format_sse,
)


class SafetyChatWorkflow:
    def __init__(
        self,
        accident_code_loader: AccidentCodeLoader | None = None,
        risk_classifier: RiskClassificationAgent | None = None,
        rag_searcher: RagSearchAgent | None = None,
        safety_responder: SafetyResponseAgent | None = None,
    ) -> None:
        self.accident_code_loader = accident_code_loader or AccidentCodeLoader()
        self.risk_classifier = risk_classifier or RiskClassificationAgent(self.accident_code_loader)
        self.rag_searcher = rag_searcher or RagSearchAgent()
        self.safety_responder = safety_responder or SafetyResponseAgent()

    async def stream(self, request: ChatRequest) -> AsyncIterator[str]:
        state = self._build_initial_state(request)
        state = await self.risk_classifier.run(state)
        state = await self.rag_searcher.run(state)
        state = await self.safety_responder.run(state)

        if state.risk_classification is None:
            raise RuntimeError("Risk classification was not produced.")

        yield format_sse(
            "risk_classification",
            RiskClassificationEvent(riskCode=state.risk_classification.parent_risk_code),
        )

        for step in state.safety_steps:
            yield format_sse(
                "safety_step",
                SafetyStepEvent(index=step.index, text=step.text),
            )

        yield format_sse(
            "final_answer",
            FinalAnswerEvent(
                title=state.title or self._build_title(state),
                answer=state.final_answer or "",
                sources=state.sources,
            ),
        )
        yield format_sse("done", DoneEvent())

    def _build_initial_state(self, request: ChatRequest) -> SafetyChatState:
        return SafetyChatState(
            message=request.message,
            target_language=request.target_language,
            session_id=request.session_id,
            title=self._build_title_from_message(request.message),
            source_language="ko",
            normalized_message=request.message,
        )

    def _build_title(self, state: SafetyChatState) -> str:
        return self._build_title_from_message(state.message)

    def _build_title_from_message(self, message: str) -> str:
        normalized = " ".join(message.split())
        if not normalized:
            return "새 안전 상담"
        if len(normalized) <= 30:
            return normalized
        return f"{normalized[:30]}..."


@lru_cache
def get_safety_chat_workflow() -> SafetyChatWorkflow:
    return SafetyChatWorkflow()
