from collections.abc import AsyncIterator
from functools import lru_cache

from app.agents.risk_classifier import RiskClassificationAgent
from app.rag.accident_code_loader import AccidentCodeLoader
from app.schemas.chat import ChatRequest, SafetyChatState, SafetyStep
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
    ) -> None:
        self.accident_code_loader = accident_code_loader or AccidentCodeLoader()
        self.risk_classifier = risk_classifier or RiskClassificationAgent(self.accident_code_loader)

    async def stream(self, request: ChatRequest) -> AsyncIterator[str]:
        state = self._build_initial_state(request)
        state = await self.risk_classifier.run(state)
        state = self._apply_mock_response(state)

        if state.risk_classification is None:
            raise RuntimeError("Risk classification was not produced.")

        yield format_sse(
            "risk_classification",
            RiskClassificationEvent(riskCode=state.risk_classification.risk_code),
        )

        for step in state.safety_steps:
            yield format_sse(
                "safety_step",
                SafetyStepEvent(index=step.index, text=step.text),
            )

        yield format_sse(
            "final_answer",
            FinalAnswerEvent(answer=state.final_answer or "", sources=state.sources),
        )
        yield format_sse("done", DoneEvent())

    def _build_initial_state(self, request: ChatRequest) -> SafetyChatState:
        return SafetyChatState(
            message=request.message,
            target_language=request.target_language,
            session_id=request.session_id,
            source_language="ko",
            normalized_message=request.message,
        )

    def _apply_mock_response(self, state: SafetyChatState) -> SafetyChatState:
        state.safety_steps = [
            SafetyStep(index=1, text="작업을 즉시 중지하세요."),
            SafetyStep(index=2, text="가능하면 위험한 장소에서 떨어지세요."),
            SafetyStep(index=3, text="관리자 또는 안전 담당자에게 바로 보고하세요."),
            SafetyStep(index=4, text="훈련받지 않았다면 기계, 전기, 화재, 화학물질을 직접 만지지 마세요."),
        ]
        state.final_answer = (
            "현재는 위험 분류 Agent까지 연결된 모의 응답입니다. 작업을 즉시 중지하고 "
            "관리자 또는 안전 담당자에게 보고하세요. 구체적인 지침은 RAG 검색과 "
            "안전 응답 Agent가 연결된 뒤 문서 근거를 바탕으로 제공됩니다."
        )
        state.sources = []
        return state


@lru_cache
def get_safety_chat_workflow() -> SafetyChatWorkflow:
    return SafetyChatWorkflow()
