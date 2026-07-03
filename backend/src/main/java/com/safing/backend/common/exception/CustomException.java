package com.safing.backend.common.exception;

import com.safing.backend.common.enumtype.ResponseCode;
import lombok.Getter;

/**
 * 서비스 로직에서 직접 발생시키는 커스텀 예외
 *
 * 예:
 * - 유효하지 않은 리프레시 토큰
 * - 지원하지 않는 국가 코드
 * - 잘못된 ID 토큰
 */
@Getter
public class CustomException extends RuntimeException {

    private final ResponseCode responseCode;
    public CustomException(ResponseCode responseCode) {
        super(responseCode.getMessage());
        this.responseCode = responseCode;
    }
}
