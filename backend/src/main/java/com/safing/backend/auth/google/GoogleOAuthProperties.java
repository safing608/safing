package com.safing.backend.auth.google;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "oauth.google")
public class GoogleOAuthProperties {
    /**
     * Google Cloud Console에서 발급받은 OAuth Client ID
     *
     * ID Token의 aud(audience) 값이 이 clientId와 일치해야
     * 우리 앱을 대상으로 발급된 토큰이라고 판단할 수 있다.
     */
    private String clientId;
}
