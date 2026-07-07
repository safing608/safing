package com.safing.backend.auth.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record RegisteredGoogleAuthResponse(
    Long userId,
    String accessToken,
    String refreshToken

) implements GoogleAuthResponse {

    @Override
    public GoogleAuthStatus status() {

        return GoogleAuthStatus.REGISTERED;
    }

    public static RegisteredGoogleAuthResponse registered(
            Long userId,
            String accessToken,
            String refreshToken
    ) {
        return new RegisteredGoogleAuthResponse(userId, accessToken, refreshToken);
    }

}
