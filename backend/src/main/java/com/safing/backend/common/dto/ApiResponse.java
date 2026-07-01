package com.safing.backend.common.dto;

import com.safing.backend.common.enumtype.ResponseCode;
import lombok.Getter;

/**
 * 모든 API에서 공통으로 사용하는 응답 객체
 *
 * @param <T> 응답 데이터 타입
 */
@Getter
public class ApiResponse<T> {
    // 응답코드 (예: REQUEST_SUCCESS)
    private final ResponseCode code;

    // 응답 메시지
    private final String message;

    // 실제 응답 데이터
    private final T data;

    // private로 생성자를 숨기고, 외부에선 ApiResponse.success 등으로 생성하게 함
    private ApiResponse(ResponseCode responseCode, String message, T data) {
        this.code = responseCode;
        this.message = message;
        this.data = data;
    }

    /**
     * 성공 응답 생성
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(
                ResponseCode.REQUEST_SUCCESS,
                message,
                data
        );
    }
}
