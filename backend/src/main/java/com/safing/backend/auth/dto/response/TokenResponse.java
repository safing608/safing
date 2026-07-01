package com.safing.backend.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TokenResponse {

        // 로그인한 사용자의 ID
        private Long userId;

        // 인증이 필요한 API 호출 시 사용하는 Access Token
        private String accessToken;

        // Access Token 만료 시 재발급에 사용하는 Refresh Token
        private String refreshToken;
}
