package com.safing.backend.auth.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.safing.backend.auth.dto.request.GoogleLoginRequest;
import com.safing.backend.auth.dto.response.TokenResponse;
import com.safing.backend.auth.entity.RefreshToken;
import com.safing.backend.auth.google.GoogleTokenVerifier;
import com.safing.backend.auth.jwt.JwtTokenProvider;
import com.safing.backend.auth.repository.RefreshTokenRepository;
import com.safing.backend.common.enumtype.OAuthProvider;
import com.safing.backend.user.entity.User;
import com.safing.backend.user.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor // final 필드를 초기화하는 생성자를 자동으로 만들어줌
@Transactional
public class AuthService {

    private final GoogleTokenVerifier googleTokenVerifier;

    private final UserRepository userRepository;

    private final RefreshTokenRepository refreshTokenRepository;

    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Google 로그인/회원가입 처리
     *
     * - Google ID Token 검증
     * - Google 고유 ID로 기존 사용자 조회
     * - 없으면 신규 사용자 생성
     * - SAFING 자체 Access Token / Refresh Token 발급
     * - Refresh Token을 DB에 저장
     */
    public TokenResponse googleLogin(GoogleLoginRequest googleLoginRequest) {
        // 1. Google ID Token 검증
        // 프론트가 보내준 Google ID Token을 검증해 사용자 정보를 담은 payload 반환
        GoogleIdToken.Payload payload =
                googleTokenVerifier.verify(googleLoginRequest.getIdToken());

        // 2. Google 사용자 정보 추출
        String oauthId = payload.getSubject();
        String username = (String) payload.get("name");

        // 3. 기존 사용자 조회 / 신규 회원이라면 회원가입
        User user = userRepository
                .findByOauthProviderAndOauthId(OAuthProvider.GOOGLE, oauthId)
                .orElseGet(() -> userRepository.save(
                        User.createGoogleUser(
                                oauthId,
                                username,
                                googleLoginRequest.getCountryCode()
                        )
                ));

        // 4. Access Token 새로 생성
        String accessToken = jwtTokenProvider.generateAccessToken(user.getUserId());

        // 5. Refresh Token 새로 생성
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getUserId());


        // 6. 새 Refresh Token 해시를 DB에 저장
        String tokenHash = hashToken(refreshToken);

        refreshTokenRepository.save(
                RefreshToken.create(
                        user,
                        tokenHash,
                        jwtTokenProvider.extractExpiration(refreshToken)
                )
        );

        // 7. TokenResponse 반환
        return new TokenResponse(user.getUserId(), accessToken, refreshToken);
    }

    // Refresh Token의 원문 대신 SHA-256 해시값으로 저장하기 위한 변환 메서드
    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256"); // SHA-256 알고리즘을 사용하는 해시 객체 생성
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8)); // 실제 해시 계산 수행

            return HexFormat.of().formatHex(hash); // byte[]를 16진수 문자열로 변환

        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 알고리즘을 사용할 수 없습니다.", e);
        }
    }
}
