package com.safing.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration // Spring 설정 파일이라고 알려주는 어노테이션
@EnableWebSecurity // Spring Security를 활성화하도록 준비 (인증, 인가, 보안필터, 로그인 등)
public class SecurityConfig {

    /**
     * Spring Security의 필터 체인을 설정하는 Bean
     *  - Spring Security는 사용자의 요청이 들어오면 여러 개의 Filter를 거침
     *  - Filter 들의 순서를 관리하는 객체가 SecurityFilterChain
     */
    @Bean // 해당 메서드가 반환하는 객체를 Spring Bean으로 등록
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                // JWT 기반 인증에서는 서버 세션을 사용하지 않으므로 CSRF 비활성화
                .csrf(AbstractHttpConfigurer::disable)

                // JWT 기반 인증은 Stateless 구조이므로 세션 생성 X
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // Spring Security의 기본 로그아웃 대신 커스텀 로그아웃 사용
                .logout(AbstractHttpConfigurer::disable)

                // API별 접근 권한 설정
                .authorizeHttpRequests(auth -> auth
                        // 인증 없이 접근 가능한 API
                        .requestMatchers(
                                "/api/auth/google", // Google 로그인/회원가입
                                "/api/auth/reissue", // 토큰 재발급
                                "/swagger-ui/**",
                                "/v3/api-docs/**"
                        ).permitAll()

                        .anyRequest().authenticated()
                )
                .build(); // 설정완료 -> SecurityFilterChain 생성
    }
}
