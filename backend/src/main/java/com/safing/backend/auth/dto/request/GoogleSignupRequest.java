package com.safing.backend.auth.dto.request;

import com.safing.backend.common.enumtype.CountryCode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record GoogleSignupRequest(

        @NotBlank(message = "Google ID Token은 필수입니다.")
        String idToken,

        @NotNull(message = "국가 코드는 필수입니다.")
        CountryCode countryCode
) {
}
