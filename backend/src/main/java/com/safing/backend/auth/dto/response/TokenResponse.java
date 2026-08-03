package com.safing.backend.auth.dto.response;

import com.safing.backend.common.enumtype.CountryCode;

public record TokenResponse(
        // 로그인한 사용자의 ID
        Long userId,

        // 로그인한 사용자의 CountryCode
        CountryCode countryCode,

        // 인증이 필요한 API 호출 시 사용하는 Access Token
        String accessToken,

        // Access Token 만료 시 재발급에 사용하는 Refresh Token
        String refreshToken
) {

}
