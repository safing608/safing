package com.safing.backend.auth.dto.request;

import com.safing.backend.common.enumtype.CountryCode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class GoogleLoginRequest {
    /**
     * 프론트엔드에서 Google 로그인 이후 받은 ID Token
     * - 백엔드에서 이 토큰을 Google에 검증 요청
     * - 검증 성공 시 Google 계정의 고유 ID, 이메일, 이름 등을 얻을 수 있음
     */
    @NotBlank(message = "Google ID Token은 필수입니다.") // 빈 문자열, 공백 문자열, null 전부 금지
    private String idToken;

    @NotNull(message = "언어 코드는 필수입니다.")
    private CountryCode countryCode;
}
