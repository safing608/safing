package com.safing.backend.auth.controller;

import com.safing.backend.auth.dto.request.GoogleLoginRequest;
import com.safing.backend.auth.dto.request.GoogleSignupRequest;
import com.safing.backend.auth.dto.request.LogoutRequest;
import com.safing.backend.auth.dto.request.ReissueRequest;
import com.safing.backend.auth.dto.response.GoogleAuthResponse;
import com.safing.backend.auth.dto.response.GoogleAuthStatus;
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
     * Google 로그인/회원가입 진입 API
     */
    @PostMapping("/google")
    public ResponseEntity<ApiResponse<GoogleAuthResponse>> googleAuth(
            @Valid @RequestBody GoogleLoginRequest request
    ) {
        GoogleAuthResponse response = authService.googleAuth(request.idToken());

        return ResponseEntity.ok(
                ApiResponse.success(response.message(), response)
        );
    }

    /**
     * Google 회원가입 완료 API
     */
    @PostMapping("/google/signup")
    public ResponseEntity<ApiResponse<TokenResponse>> googleSignup(
            @Valid @RequestBody GoogleSignupRequest request
    ){
        TokenResponse response = authService.googleSignup(request.idToken(), request.countryCode());

        return ResponseEntity.ok(
                ApiResponse.success("회원가입 및 로그인에 성공했습니다.", response)
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
