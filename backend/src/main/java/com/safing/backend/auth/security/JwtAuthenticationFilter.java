package com.safing.backend.auth.security;

import com.safing.backend.auth.jwt.JwtTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws IOException, ServletException {

        // 1. 클라이언트가 보낸 Authorization 값 꺼내기
        String authorizationHeader = request.getHeader("Authorization");

        // 2. Authorization 헤더가 없거나 Bearer 토큰 형식이 아니라면 다음 필터로 넘김
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. 실제 토큰부분만 꺼내기
        String accessToken = authorizationHeader.substring(7);


        if (jwtTokenProvider.validateToken(accessToken) && jwtTokenProvider.isAccessToken(accessToken)) {
            // 4. 토큰 검증 후  userId 꺼내기
            Long userId = jwtTokenProvider.getUserId(accessToken);

            // 5. SecurityContext에 인증 정보 넣기
            Authentication authentication =
                    new UsernamePasswordAuthenticationToken(
                            new AuthUser(userId), // principal: 인증된 사용자 정보
                            null, // credentials: 비밀번호 같은 인증 수단 (JWT는 null)
                            Collections.emptyList() // authorities: 권한 목록
                    );

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }
}
