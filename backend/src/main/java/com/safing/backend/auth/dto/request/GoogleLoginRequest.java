package com.safing.backend.auth.dto.request;

import com.safing.backend.common.enumtype.CountryCode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record GoogleLoginRequest (

        @NotBlank(message = "Google ID Token은 필수입니다.") // 빈 문자열, 공백 문자열, null 전부 금지
        String idToken

) {

}
