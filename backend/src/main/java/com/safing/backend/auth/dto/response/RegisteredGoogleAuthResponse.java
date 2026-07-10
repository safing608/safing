package com.safing.backend.auth.dto.response;

import com.safing.backend.common.enumtype.CountryCode;

public record RegisteredGoogleAuthResponse(
    Long userId,
    CountryCode countryCode,
    String accessToken,
    String refreshToken

) implements GoogleAuthResponse {

    @Override
    public GoogleAuthStatus status() {

        return GoogleAuthStatus.REGISTERED;
    }

    @Override
    public String message() {

        return "로그인에 성공했습니다.";
    }

    public static RegisteredGoogleAuthResponse registered(
            Long userId,
            CountryCode countryCode,
            String accessToken,
            String refreshToken
    ) {
        return new RegisteredGoogleAuthResponse(userId, countryCode, accessToken, refreshToken);
    }

}
