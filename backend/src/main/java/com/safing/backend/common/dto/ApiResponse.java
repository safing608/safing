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

    // 응답코드 문자열 (예: REQUEST_SUCCESS)
    private final String code;

    // 응답 메시지
    private final String message;

    // 실제 응답 데이터
    private final T data;

    // private로 생성자를 숨기고, 외부에선 ApiResponse.success 등으로 생성하게 함
    private ApiResponse(String code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    /**
     * 기본 성공 응답 생성
     */
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(
                ResponseCode.REQUEST_SUCCESS.getCode(),
                ResponseCode.REQUEST_SUCCESS.getMessage(),
                data
        );
    }

    /**
     * 성공 메시지를 직접 지정하는 성공 응답 생성
     *
     * API마다 성공 메시지가 다를 때 사용한다.
     * 예: "국가 코드가 변경되었습니다."
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(
                ResponseCode.REQUEST_SUCCESS.getCode(),
                message,
                data
        );
    }

    /**
     * 에러 응답 생성
     */
    public static <T> ApiResponse<T> error(ResponseCode responseCode) {
        return new ApiResponse<>(
                responseCode.getCode(),
                responseCode.getMessage(),
                null
        );
    }

    /**
     * 에러 메시지를 직접 지정하는 에러 응답 생성
     *
     * validation 에러처럼 상세 메시지를 따로 내려주고 싶을 때 사용한다.
     */
    public static <T> ApiResponse<T> error(ResponseCode responseCode, String message) {
        return new ApiResponse<>(
                responseCode.getCode(),
                message,
                null
        );
    }
}
