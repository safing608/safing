package com.safing.backend.common.enumtype;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ResponseCode {
    REQUEST_SUCCESS(HttpStatus.OK, "REQUEST_SUCCESS", "요청이 성공했습니다."),

    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "INVALID_REQUEST", "잘못된 요청입니다."),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "인증에 실패했습니다."),
    FORBIDDEN(HttpStatus.FORBIDDEN, "FORBIDDEN", "접근 권한이 없습니다."),

    INVALID_ID_TOKEN(HttpStatus.UNAUTHORIZED, "INVALID_ID_TOKEN", "유효하지 않은 ID 토큰입니다."),
    INVALID_REFRESH_TOKEN(HttpStatus.UNAUTHORIZED, "INVALID_REFRESH_TOKEN", "유효하지 않은 리프레시 토큰입니다."),
    INVALID_ACCESS_TOKEN(HttpStatus.UNAUTHORIZED, "INVALID_ACCESS_TOKEN", "유효하지 않은 액세스 토큰입니다."),

    UNSUPPORTED_COUNTRY_CODE(HttpStatus.BAD_REQUEST, "UNSUPPORTED_COUNTRY_CODE", "지원하지 않는 국가 코드입니다."),
    DUPLICATE_SIGNUP_REQUEST(HttpStatus.CONFLICT, "DUPLICATE_SIGNUP_REQUEST", "이미 처리 중인 회원가입 요청입니다. 잠시 후 다시 시도해주세요."),

    SESSION_NOT_FOUND(HttpStatus.NOT_FOUND, "SESSION_NOT_FOUND", "대화를 찾을 수 없습니다."),
    MESSAGE_NOT_FOUND(HttpStatus.NOT_FOUND, "MESSAGE_NOT_FOUND", "메시지를 찾을 수 없습니다."),
    RISK_TYPE_NOT_FOUND(HttpStatus.NOT_FOUND, "RISK_TYPE_NOT_FOUND", "위험 유형을 찾을 수 없습니다."),

    INVALID_MESSAGE_STATUS(HttpStatus.BAD_REQUEST, "INVALID_MESSAGE_STATUS", "요청을 처리할 수 없는 메시지 상태입니다."),
    MESSAGE_NOT_RETRYABLE(HttpStatus.CONFLICT, "MESSAGE_NOT_RETRYABLE", "재시도 가능한 메시지가 아닙니다."),

    AI_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "AI_SERVER_ERROR", "AI 답변 생성에 실패했습니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR", "서버 내부 오류가 발생했습니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;

}
