package com.safing.backend.common.exception;

import com.safing.backend.common.dto.ApiResponse;
import com.safing.backend.common.enumtype.ResponseCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 애플리케이션 전역 예외 처리 클래스
 *
 * Controller 또는 Service에서 발생한 예외를 공통 응답 형식으로 변환한다.
 */
@Slf4j
@RestControllerAdvice // Spring이 예외 발생시 어노테이션이 붙은 클래스를 찾아서 @ExceptionHandler가 붙은 메서드를 실행
public class GlobalExceptionHandler {

    /**
     * 직접 정의한 비즈니스 예외 처리
     *
     * 예:
     * - INVALID_ID_TOKEN
     * - INVALID_REFRESH_TOKEN
     * - UNSUPPORTED_COUNTRY_CODE
     */
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ApiResponse<Void>> handleCustomException(CustomException e) {
        ResponseCode responseCode = e.getResponseCode();

        return ResponseEntity
                .status(responseCode.getHttpStatus())
                .body(ApiResponse.error(responseCode));
    }

    /**
     * @Valid 검증 실패 처리
     *
     * 예:
     * - 요청 Body 값이 비어 있음
     * - @NotBlank, @NotNull 조건을 만족하지 않음
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(
            MethodArgumentNotValidException e
    ) {
        String message = e.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
                .orElse(ResponseCode.INVALID_REQUEST.getMessage());

        return ResponseEntity
                .status(ResponseCode.INVALID_REQUEST.getHttpStatus())
                .body(ApiResponse.error(ResponseCode.INVALID_REQUEST, message));
    }

    /**
     * 예상하지 못한 서버 내부 오류 처리
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception e) {
        log.error("예상하지 못한 예외 발생", e);

        return ResponseEntity
                .status(ResponseCode.INTERNAL_SERVER_ERROR.getHttpStatus())
                .body(ApiResponse.error(ResponseCode.INTERNAL_SERVER_ERROR));
    }
}
