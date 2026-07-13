package com.safing.backend.auth.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.safing.backend.common.dto.ApiResponse;
import com.safing.backend.common.enumtype.ResponseCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * 인증이 필요한 API에 토큰 없이 접근하거나 인증에 실패했을 때 Spring Security가 호출하는 컴포넌트
 * 기본 응답 대신 SAFING의 ApiResponse 형식으로 401 응답을 내려주기 위해 구현
 */
@Component
@RequiredArgsConstructor
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value()); // 401
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());

        ApiResponse<Void> body = ApiResponse.error(ResponseCode.UNAUTHORIZED);

        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}