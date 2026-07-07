package com.safing.backend.auth.dto.response;

public record SignupRequiredGoogleAuthResponse()
        implements GoogleAuthResponse {

    @Override
    public GoogleAuthStatus status() {

        return GoogleAuthStatus.SIGNUP_REQUIRED;
    }

    @Override
    public String message() {
        return "회원가입이 필요합니다.";
    }

    public static SignupRequiredGoogleAuthResponse signupRequired() {
        return new SignupRequiredGoogleAuthResponse();
    }
}
