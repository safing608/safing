from app.schemas.chat import SafetyChatState, SafetyStep
from app.schemas.safety_response import SafetyResponseResult
from app.services.llm_safety_response_generator import LlmSafetyResponseGenerator


class SafetyResponseAgent:
    name = "safety_responder"

    def __init__(
        self,
        response_generator: LlmSafetyResponseGenerator | None = None,
    ) -> None:
        self.response_generator = response_generator or LlmSafetyResponseGenerator()

    async def run(self, state: SafetyChatState) -> SafetyChatState:
        response = self.response_generator.generate(state)
        if response is None:
            response = self._fallback_response(state)

        state.safety_steps = [
            SafetyStep(index=index, text=text)
            for index, text in enumerate(response.safety_steps, start=1)
        ]
        state.final_answer = response.answer
        return state

    def _fallback_response(self, state: SafetyChatState) -> SafetyResponseResult:
        if not state.retrieved_chunks:
            return SafetyResponseResult(
                safetySteps=[
                    "작업을 즉시 중지하세요.",
                    "가능하면 위험한 장소에서 떨어지세요.",
                    "관리자 또는 안전 담당자에게 바로 보고하세요.",
                    "관련 안전 문서 근거가 충분하지 않으므로 현장 절차를 따르세요.",
                ],
                answer=(
                    "관련 안전 문서 근거가 충분하지 않습니다. 작업을 즉시 중지하고 "
                    "위험한 장소에서 떨어진 뒤 관리자 또는 안전 담당자에게 보고하세요. "
                    "부상, 화재, 감전 등 긴급 위험이 있으면 현장 비상 절차를 따르세요."
                ),
            )

        risk_type = (
            state.risk_classification.parent_risk_type
            if state.risk_classification is not None
            else "안전"
        )
        top_chunk = state.retrieved_chunks[0]
        document_name = top_chunk.source.document_name or "검색된 안전 문서"
        evidence_summary = self._summarize_evidence(top_chunk.content)

        return SafetyResponseResult(
            safetySteps=[
                "작업을 즉시 중지하세요.",
                "가능하면 위험한 장소에서 떨어지세요.",
                "관리자 또는 안전 담당자에게 바로 보고하세요.",
                "검색된 안전 문서의 지침을 확인한 뒤 현장 절차를 따르세요.",
            ],
            answer=(
                f"{risk_type} 위험이 의심됩니다. 작업을 즉시 중지하고 관리자 또는 안전 담당자에게 "
                f"보고하세요. 검색된 문서 '{document_name}'에서 {evidence_summary} "
                "문서 근거가 더 필요하면 현장 안전 담당자의 "
                "확인을 받은 뒤 후속 조치를 진행하세요."
            ),
        )

    def _summarize_evidence(self, content: str) -> str:
        normalized = " ".join(content.split())
        if "방호장치" in normalized:
            return "방호장치와 기계ㆍ설비 작업점의 위험을 확인했습니다."
        if "전원" in normalized or "감전" in normalized:
            return "전기 위험과 전원 차단 관련 내용을 확인했습니다."
        if "화재" in normalized or "소화" in normalized:
            return "화재 대응과 소화 관련 내용을 확인했습니다."
        if "보호구" in normalized:
            return "보호구 착용과 안전 조치 관련 내용을 확인했습니다."
        return "관련 안전 조치 내용을 확인했습니다."
