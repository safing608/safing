from enum import StrEnum


class ErrorCode(StrEnum):
    INVALID_REQUEST = "INVALID_REQUEST"
    UNAUTHORIZED = "UNAUTHORIZED"
    SESSION_NOT_FOUND = "SESSION_NOT_FOUND"
    SESSION_ACCESS_DENIED = "SESSION_ACCESS_DENIED"
    MESSAGE_SAVE_FAILED = "MESSAGE_SAVE_FAILED"
    RISK_CLASSIFICATION_FAILED = "RISK_CLASSIFICATION_FAILED"
    RAG_RETRIEVAL_FAILED = "RAG_RETRIEVAL_FAILED"
    LLM_GENERATION_FAILED = "LLM_GENERATION_FAILED"
    LLM_TIMEOUT = "LLM_TIMEOUT"
    LLM_RATE_LIMITED = "LLM_RATE_LIMITED"
    TRANSLATION_FAILED = "TRANSLATION_FAILED"
    STREAMING_FAILED = "STREAMING_FAILED"
    TITLE_GENERATION_FAILED = "TITLE_GENERATION_FAILED"
    SAFETY_BLOCKED = "SAFETY_BLOCKED"
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR"


ERROR_MESSAGES = {
    ErrorCode.INVALID_REQUEST: "요청 형식이 올바르지 않습니다.",
    ErrorCode.UNAUTHORIZED: "로그인 또는 인증이 필요합니다.",
    ErrorCode.SESSION_NOT_FOUND: "요청한 대화 세션을 찾을 수 없습니다.",
    ErrorCode.SESSION_ACCESS_DENIED: "해당 대화 세션에 접근할 권한이 없습니다.",
    ErrorCode.MESSAGE_SAVE_FAILED: "메시지를 저장하는 중 오류가 발생했습니다.",
    ErrorCode.RISK_CLASSIFICATION_FAILED: "질문의 위험 유형을 분류하는 중 오류가 발생했습니다.",
    ErrorCode.RAG_RETRIEVAL_FAILED: "관련 안전 문서를 검색하는 중 오류가 발생했습니다.",
    ErrorCode.LLM_GENERATION_FAILED: "안전 답변을 생성하는 중 오류가 발생했습니다.",
    ErrorCode.LLM_TIMEOUT: "안전 답변 생성 시간이 초과되었습니다.",
    ErrorCode.LLM_RATE_LIMITED: "AI 요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.",
    ErrorCode.TRANSLATION_FAILED: "다국어 응답을 처리하는 중 오류가 발생했습니다.",
    ErrorCode.STREAMING_FAILED: "응답을 전송하는 중 오류가 발생했습니다.",
    ErrorCode.TITLE_GENERATION_FAILED: "대화 제목을 생성하는 중 오류가 발생했습니다.",
    ErrorCode.SAFETY_BLOCKED: "안전 정책상 답변할 수 없는 요청입니다.",
    ErrorCode.INTERNAL_SERVER_ERROR: "서버 내부 오류가 발생했습니다.",
}


def error_message_for(code: ErrorCode) -> str:
    return ERROR_MESSAGES.get(code, ERROR_MESSAGES[ErrorCode.INTERNAL_SERVER_ERROR])
