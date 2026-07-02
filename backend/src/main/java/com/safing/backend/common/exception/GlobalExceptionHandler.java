package com.safing.backend.common.exception;

import com.safing.backend.common.dto.ApiResponse;
import com.safing.backend.common.enumtype.ResponseCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice // Spring이 예외 발생시 어노테이션이 붙은 클래스를 찾아서 @ExceptionHandler가 붙은 메서드를 실행
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidIdTokenException.class)
    public ResponseEntity<ApiResponse<Void>> handleInvalidIdTokenException(InvalidIdTokenException e) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(
                        ResponseCode.INVALID_ID_TOKEN,
                        e.getMessage()
                ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception e) {

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(
                        ResponseCode.INTERNAL_SERVER_ERROR,
                        "서버 내부 오류가 발생했습니다."
                ));
    }

    @ExceptionHandler(InvalidRefreshTokenException.class)
    public ResponseEntity<ApiResponse<Void>> handleInvalidRefreshTokenException(InvalidRefreshTokenException e) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(
                        ResponseCode.INVALID_REFRESH_TOKEN,
                        e.getMessage()
                ));
    }
}
