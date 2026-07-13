package com.safing.backend.auth.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.safing.backend.common.dto.ApiResponse;
import com.safing.backend.common.enumtype.ResponseCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * 인증은 되었지만 접근 권한이 부족할 때 Spring Security가 호출하는 컴포넌트
 * 관리자 권한이 필요한 API에 일반 사용자가 접근하는 등의 경우 403 응답을 내려줌
 */
@Component
@RequiredArgsConstructor
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException accessDeniedException
    ) throws IOException {
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());

        ApiResponse<Void> body = ApiResponse.error(ResponseCode.FORBIDDEN);

        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}