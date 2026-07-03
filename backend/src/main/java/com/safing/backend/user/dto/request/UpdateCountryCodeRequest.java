package com.safing.backend.user.dto.request;

import jakarta.validation.constraints.NotBlank;

public record UpdateCountryCodeRequest(
        @NotBlank(message = "국가 코드는 필수입니다.")
        String countryCode
) {
}
