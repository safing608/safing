package com.safing.backend.auth.controller;

import com.safing.backend.auth.jwt.JwtTokenProvider;
import com.safing.backend.common.dto.ApiResponse;
import com.safing.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Profile("dev")
@RestController
@RequestMapping("/api/dev/auth")
@RequiredArgsConstructor
public class DevAuthController {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    /**
     * 개발용 Access Token 발급 API
     */
    @PostMapping("/access-token/{userId}")
    public ResponseEntity<ApiResponse<String>> issueAccessToken(@PathVariable Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다.");
        }

        String accessToken = jwtTokenProvider.generateAccessToken(userId);

        return ResponseEntity.ok(
                ApiResponse.success("개발용 Access Token이 발급되었습니다.", accessToken)
        );
    }

}
