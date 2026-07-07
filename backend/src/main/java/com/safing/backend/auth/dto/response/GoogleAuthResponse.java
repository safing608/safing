package com.safing.backend.auth.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

public sealed interface GoogleAuthResponse
        permits RegisteredGoogleAuthResponse, SignupRequiredGoogleAuthResponse {

    @JsonProperty("status")
    GoogleAuthStatus status();

    @JsonIgnore
    String message();
}
