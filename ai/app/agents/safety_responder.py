from app.schemas.chat import SafetyChatState, SafetyStep
from app.schemas.safety_response import SafetyResponseResult
from app.services.llm_safety_response_generator import LlmSafetyResponseGenerator
from app.services.risk_type_name_resolver import RiskTypeNameResolver


FALLBACK_MESSAGES = {
    "ko": {
        "steps": [
            "작업을 즉시 중지하세요.",
            "가능하면 위험한 장소에서 떨어지세요.",
            "관리자 또는 안전 담당자에게 바로 보고하세요.",
            "관련 안전 문서의 지침을 확인한 뒤 현장 절차를 따르세요.",
        ],
        "insufficient_answer": (
            "관련 안전 문서 근거가 충분하지 않습니다. 작업을 즉시 중지하고 "
            "위험한 장소에서 떨어진 뒤 관리자 또는 안전 담당자에게 보고하세요. "
            "부상, 화재, 감전 등 긴급 위험이 있으면 현장 비상 절차를 따르세요."
        ),
        "risk_answer": (
            "{risk_type} 위험이 의심됩니다. 작업을 즉시 중지하고 관리자 또는 안전 담당자에게 "
            "보고하세요. 검색된 문서 '{document_name}'에서 {evidence_summary} "
            "문서 근거가 더 필요하면 현장 안전 담당자의 확인을 받은 뒤 후속 조치를 진행하세요."
        ),
        "evidence": {
            "guard": "방호장치와 기계ㆍ설비 작업점의 위험을 확인했습니다.",
            "electric": "전기 위험과 전원 차단 관련 내용을 확인했습니다.",
            "fire": "화재 대응과 소화 관련 내용을 확인했습니다.",
            "ppe": "보호구 착용과 안전 조치 관련 내용을 확인했습니다.",
            "default": "관련 안전 조치 내용을 확인했습니다.",
        },
    },
    "en": {
        "steps": [
            "Stop work immediately.",
            "Move away from the danger if possible.",
            "Report to your supervisor or safety manager now.",
            "Check the safety document guidance and follow site procedures.",
        ],
        "insufficient_answer": (
            "There is not enough supporting safety document evidence. Stop work immediately, "
            "move away from the danger, and report to your supervisor or safety manager. "
            "Follow emergency procedures if there is injury, fire, electric shock, or serious danger."
        ),
        "risk_answer": (
            "{risk_type} risk is suspected. Stop work immediately and report to your supervisor "
            "or safety manager. The document '{document_name}' includes related safety guidance. "
            "Ask the site safety manager before taking further action."
        ),
    },
    "vi": {
        "steps": [
            "Dừng công việc ngay lập tức.",
            "Nếu có thể, hãy rời khỏi khu vực nguy hiểm.",
            "Báo ngay cho quản lý hoặc người phụ trách an toàn.",
            "Kiểm tra hướng dẫn an toàn và làm theo quy trình tại nơi làm việc.",
        ],
        "insufficient_answer": (
            "Chưa có đủ căn cứ từ tài liệu an toàn liên quan. Hãy dừng công việc ngay, "
            "rời khỏi nơi nguy hiểm và báo cho quản lý hoặc người phụ trách an toàn. "
            "Nếu có chấn thương, cháy, điện giật hoặc nguy hiểm nghiêm trọng, hãy làm theo quy trình khẩn cấp."
        ),
        "risk_answer": (
            "Có nguy cơ {risk_type}. Hãy dừng công việc ngay và báo cho quản lý hoặc người phụ trách an toàn. "
            "Tài liệu '{document_name}' có hướng dẫn an toàn liên quan. Hãy hỏi người phụ trách an toàn "
            "trước khi tiếp tục xử lý."
        ),
    },
    "ne": {
        "steps": [
            "तुरुन्त काम रोक्नुहोस्।",
            "सम्भव भए खतरनाक ठाउँबाट टाढा जानुहोस्।",
            "सुपरभाइजर वा सुरक्षा जिम्मेवार व्यक्तिलाई तुरुन्त जानकारी दिनुहोस्।",
            "सुरक्षा कागजातको निर्देशन हेर्नुहोस् र कार्यस्थलको प्रक्रिया पालना गर्नुहोस्।",
        ],
        "insufficient_answer": (
            "सम्बन्धित सुरक्षा कागजातको प्रमाण पर्याप्त छैन। तुरुन्त काम रोक्नुहोस्, "
            "खतरनाक ठाउँबाट टाढा जानुहोस्, र सुपरभाइजर वा सुरक्षा जिम्मेवार व्यक्तिलाई जानकारी दिनुहोस्। "
            "चोटपटक, आगो, करेन्ट लाग्ने वा गम्भीर खतरा भए आपतकालीन प्रक्रिया पालना गर्नुहोस्।"
        ),
        "risk_answer": (
            "{risk_type} जोखिम हुन सक्छ। तुरुन्त काम रोक्नुहोस् र सुपरभाइजर वा सुरक्षा जिम्मेवार "
            "व्यक्तिलाई जानकारी दिनुहोस्। '{document_name}' कागजातमा सम्बन्धित सुरक्षा निर्देशन छ। "
            "थप कार्य गर्नु अघि सुरक्षा जिम्मेवार व्यक्तिसँग पुष्टि गर्नुहोस्।"
        ),
    },
    "km": {
        "steps": [
            "បញ្ឈប់ការងារភ្លាមៗ។",
            "បើអាចធ្វើបាន សូមចាកចេញពីតំបន់គ្រោះថ្នាក់។",
            "រាយការណ៍ទៅអ្នកគ្រប់គ្រង ឬអ្នកទទួលខុសត្រូវសុវត្ថិភាពភ្លាមៗ។",
            "ពិនិត្យការណែនាំសុវត្ថិភាព ហើយអនុវត្តតាមនីតិវិធីនៅកន្លែងធ្វើការ។",
        ],
        "insufficient_answer": (
            "មិនមានភស្តុតាងគ្រប់គ្រាន់ពីឯកសារសុវត្ថិភាពដែលពាក់ព័ន្ធទេ។ សូមបញ្ឈប់ការងារភ្លាមៗ "
            "ចាកចេញពីគ្រោះថ្នាក់ ហើយរាយការណ៍ទៅអ្នកគ្រប់គ្រង ឬអ្នកទទួលខុសត្រូវសុវត្ថិភាព។ "
            "បើមានរបួស អគ្គិភ័យ ឆក់អគ្គិសនី ឬគ្រោះថ្នាក់ធ្ងន់ សូមអនុវត្តតាមនីតិវិធីបន្ទាន់។"
        ),
        "risk_answer": (
            "អាចមានហានិភ័យ {risk_type}។ សូមបញ្ឈប់ការងារភ្លាមៗ ហើយរាយការណ៍ទៅអ្នកគ្រប់គ្រង "
            "ឬអ្នកទទួលខុសត្រូវសុវត្ថិភាព។ ឯកសារ '{document_name}' មានការណែនាំសុវត្ថិភាពពាក់ព័ន្ធ។ "
            "សូមពិនិត្យជាមួយអ្នកទទួលខុសត្រូវសុវត្ថិភាព មុនធ្វើសកម្មភាពបន្ត។"
        ),
    },
}

class SafetyResponseAgent:
    name = "safety_responder"

    def __init__(
        self,
        response_generator: LlmSafetyResponseGenerator | None = None,
        risk_type_name_resolver: RiskTypeNameResolver | None = None,
    ) -> None:
        self.response_generator = response_generator or LlmSafetyResponseGenerator()
        self.risk_type_name_resolver = risk_type_name_resolver or RiskTypeNameResolver()

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
        fallback = FALLBACK_MESSAGES.get(state.target_language, FALLBACK_MESSAGES["ko"])
        if not state.retrieved_chunks:
            return SafetyResponseResult(
                safetySteps=fallback["steps"],
                answer=fallback["insufficient_answer"],
            )

        risk_type = self._localized_risk_type(state)
        top_chunk = state.retrieved_chunks[0]
        document_name = top_chunk.source.document_name or "검색된 안전 문서"
        evidence_summary = self._summarize_evidence(top_chunk.content, state.target_language)

        return SafetyResponseResult(
            safetySteps=fallback["steps"],
            answer=fallback["risk_answer"].format(
                risk_type=risk_type,
                document_name=document_name,
                evidence_summary=evidence_summary,
            ),
        )

    def _summarize_evidence(self, content: str, language: str = "ko") -> str:
        fallback = FALLBACK_MESSAGES.get(language, FALLBACK_MESSAGES["ko"])
        evidence_messages = fallback.get("evidence", FALLBACK_MESSAGES["ko"]["evidence"])
        normalized = " ".join(content.split())
        if "방호장치" in normalized:
            return evidence_messages["guard"]
        if "전원" in normalized or "감전" in normalized:
            return evidence_messages["electric"]
        if "화재" in normalized or "소화" in normalized:
            return evidence_messages["fire"]
        if "보호구" in normalized:
            return evidence_messages["ppe"]
        return evidence_messages["default"]

    def _localized_risk_type(self, state: SafetyChatState) -> str:
        language = state.target_language
        if state.risk_classification is None:
            return "safety" if language != "ko" else "안전"

        localized_name = self.risk_type_name_resolver.resolve(
            risk_type_code=state.risk_classification.parent_risk_code,
            language=language,
        )
        if localized_name is not None:
            return localized_name

        if language == "ko":
            return state.risk_classification.parent_risk_type
        return "safety"
