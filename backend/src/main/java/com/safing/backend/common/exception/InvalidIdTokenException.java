package com.safing.backend.common.exception;

public class InvalidIdTokenException extends RuntimeException {

    public InvalidIdTokenException() {
        super("유효하지 않은 Google ID Token 입니다."); // 부모클래스(RuntimeException)의 생성자 호출
    }
}
