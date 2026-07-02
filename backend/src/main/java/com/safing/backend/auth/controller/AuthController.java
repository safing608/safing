package com.safing.backend.auth.controller;

import com.safing.backend.auth.dto.request.GoogleLoginRequest;
import com.safing.backend.auth.dto.request.LogoutRequest;
import com.safing.backend.auth.dto.request.ReissueRequest;
import com.safing.backend.auth.dto.response.ReissueResponse;
import com.safing.backend.auth.dto.response.TokenResponse;
import com.safing.backend.auth.service.AuthService;
import com.safing.backend.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

@RestController // 이 클래스가 REST API 컨트롤러라는 뜻. 반환한 Java 객체가 JSON으로 변환됨.
@RequestMapping("/api/auth") // 컨트롤러의 기본 URL
@RequiredArgsConstructor // final AuthService authService를 주입받는 생성자를 자동으로 만들어줌
public class AuthController {
    private final AuthService authService;

    /**
     * Google 로그인/회원가입 API
     *
     * @Valid: DTO에 붙어있는 @NotNull 같은 검증 어노테이션을 실행시키는 스위치 역할
     * @RequestBody: HTTP 요청의 Body(JSON)을 Java 객체로 변환
     */
    @PostMapping("/google")
    public ResponseEntity<ApiResponse<TokenResponse>> googleLogin(
            @Valid @RequestBody GoogleLoginRequest request
    ) {
        TokenResponse response = authService.googleLogin(
                request.idToken(),
                request.countryCode()
        );

        return ResponseEntity.ok(
                ApiResponse.success("로그인에 성공했습니다.", response)
        );
    }

    /**
     * 로그아웃 API
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
        Authentication authentication,
        @Valid @RequestBody LogoutRequest request
    ){
        Long userId = Long.valueOf(authentication.getName());

        authService.logout(userId, request.refreshToken());

        return ResponseEntity.ok(
                ApiResponse.success("로그아웃에 성공했습니다.",null)
        );
    }

    /**
     * 토큰 재발급 API
     */
    @PostMapping("/reissue")
    public ResponseEntity<ApiResponse<ReissueResponse>> reissue(
            @Valid @RequestBody ReissueRequest request
    ){
        ReissueResponse response = authService.reissue(request.refreshToken());

        return ResponseEntity.ok(
                ApiResponse.success("토큰 재발급에 성공했습니다.",
                response
                )
        );
    }

}
