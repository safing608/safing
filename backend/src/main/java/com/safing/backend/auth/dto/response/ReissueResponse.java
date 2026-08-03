package com.safing.backend.auth.dto.response;

public record ReissueResponse(
        // 새로 발급된 Access Token
        String accessToken,

        // 새로 발급된 Refresh Token
        String refreshToken
) {
}
