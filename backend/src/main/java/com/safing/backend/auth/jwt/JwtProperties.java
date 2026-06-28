package com.safing.backend.auth.jwt;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "jwt")
// 이 클래스는 yaml파일의 'jwt' 아래에 있는 설정값들을 담을 객체야. 라고 정의.
// 스프링이 Bean으로 자동 등록하지 않기 때문에 다른 클래스에서 주입받을 수 없음
// 메인 애플리케이션 클래스에 @ConfigurationPropertiesScan 어노테이션을 추가하면,
// @ConfigurationProperties가 붙은 모든 클래스들을 알아서 빈 등록

public class JwtProperties {

    private String secret;

    private long accessTokenExpiration;

    private long refreshTokenExpiration;
}
