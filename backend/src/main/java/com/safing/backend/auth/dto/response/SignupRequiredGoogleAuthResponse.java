package com.safing.backend.auth.dto.response;

public record SignupRequiredGoogleAuthResponse()
        implements GoogleAuthResponse {

    @Override
    public GoogleAuthStatus status() {
        return GoogleAuthStatus.SIGNUP_REQUIRED;
    }

    public static SignupRequiredGoogleAuthResponse signupRequired() {
        return new SignupRequiredGoogleAuthResponse();
    }
}
