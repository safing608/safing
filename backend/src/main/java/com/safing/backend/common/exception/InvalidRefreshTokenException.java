package com.safing.backend.common.exception;

public class InvalidRefreshTokenException extends RuntimeException {
    public InvalidRefreshTokenException() {
        super("유효하지 않은 Refresh Token 입니다.");
    }
}
