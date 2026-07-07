package com.safing.backend.auth.dto.response;

public record RegisteredGoogleAuthResponse(
    Long userId,
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
            String accessToken,
            String refreshToken
    ) {
        return new RegisteredGoogleAuthResponse(userId, accessToken, refreshToken);
    }

}
