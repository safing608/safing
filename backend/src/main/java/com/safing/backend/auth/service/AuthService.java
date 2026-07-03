package com.safing.backend.auth.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.safing.backend.auth.dto.response.ReissueResponse;
import com.safing.backend.auth.dto.response.TokenResponse;
import com.safing.backend.auth.entity.RefreshToken;
import com.safing.backend.auth.google.GoogleTokenVerifier;
import com.safing.backend.auth.jwt.JwtTokenProvider;
import com.safing.backend.auth.repository.RefreshTokenRepository;
import com.safing.backend.common.enumtype.CountryCode;
import com.safing.backend.common.enumtype.OAuthProvider;
import com.safing.backend.common.enumtype.ResponseCode;
import com.safing.backend.common.exception.CustomException;
import com.safing.backend.user.entity.User;
import com.safing.backend.user.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
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
    public TokenResponse googleLogin(String idToken, CountryCode countryCode) {
        // 1. Google ID Token 검증
        // 프론트가 보내준 Google ID Token을 검증해 사용자 정보를 담은 payload 반환
        GoogleIdToken.Payload payload =
                googleTokenVerifier.verify(idToken);

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
                                countryCode
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

    /**
     * 로그아웃
     */
    @Transactional
    public void logout(Long userId, String refreshToken){

        // 1. DB에 저장된 해시값과 비교하기 위해 클라이언트가 보낸 Refresh Token을 해시
        String tokenHash = hashToken(refreshToken);

        // 2. 해시값으로 DB에 저장된 Refresh Token 조회
        // 없을 시 유효하지 않은 Refresh Token으로 처리
        RefreshToken savedToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new CustomException(ResponseCode.INVALID_REFRESH_TOKEN));

        // 3. Authorization 헤더의 Access Token에서 꺼낸 userId와 Refresh Token의 소유자 userId가 같은지 확인
        // 다르다면 다른 사용자의 Refresh Token으로 로그아웃하려는 상황이므로 차단.
        if (!savedToken.getUser().getUserId().equals(userId)) {
            throw new CustomException(ResponseCode.INVALID_REFRESH_TOKEN);
        }

        // 4. Refresh Token이 이미 만료된 경우면 성공 처리
        // 만료된 Refresh Token은 재발급에 사용할 수 없기 때문에
        // 클라이언트 입장에서 로그아웃 성공으로 처리하는 편이 자연스러움
        if (savedToken.getExpiredAt().isBefore(LocalDateTime.now())){
            return;
        }

        // 5. 이미 로그아웃 처리된 토큰이면 다시 revokedAt을 갱신하지 않아도 됨
        if (savedToken.getRevokedAt() != null){
            return;
        }

        // 6. 정상 Refresh Token이면 revokedAt을 현재 시간으로 채워 무효화
        // @Transactional 안에서 엔티티 값을 변경하면 JPA 변경 감지로 UPDATE가 반영된다
        savedToken.revoke();
    }

    /**
     * 토큰 재발급
     */
    @Transactional
    public ReissueResponse reissue(String refreshToken){

        // 1. JWT 자체 검증
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new CustomException(ResponseCode.INVALID_REFRESH_TOKEN);
        }

        // 2. Access Token을 Refresh Token 재발급에 사용하는 것을 방지
        if (!jwtTokenProvider.isRefreshToken(refreshToken)) {
            throw new CustomException(ResponseCode.INVALID_REFRESH_TOKEN);
        }

        // 3. Refresh Token 원문을 해시로 변환
        String tokenHash = hashToken(refreshToken);

        // 4. DB에 저장된 Refresh Token인지 확인
        RefreshToken savedRefreshToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new CustomException(ResponseCode.INVALID_REFRESH_TOKEN));

        // 5. 이미 로그아웃 또는 재발급으로 무효화된 토큰인지 확인
        if (!savedRefreshToken.isValid()){
            throw new CustomException(ResponseCode.INVALID_REFRESH_TOKEN);
        }

        // 6. 토큰에 들어있는 userId 추출
        Long userId = jwtTokenProvider.getUserId(refreshToken);

        // 7. 사용자 조회
        User user = userRepository.findById(userId).orElseThrow(() -> new CustomException(ResponseCode.INVALID_REFRESH_TOKEN));

        // 8. DB에 저장된 토큰의 사용자 == JWT subject의 사용자 확인
        if(!savedRefreshToken.getUser().getUserId().equals(userId)){
            throw new CustomException(ResponseCode.INVALID_REFRESH_TOKEN);
        }

        // 9. 기존 Refresh Token 무효화
        // - 한 번 재발급에 사용한 Refresh Token은 다시 사용할 수 없게 함
        savedRefreshToken.revoke();

        // 10. 새 Access Token 발급
        String newAccessToken = jwtTokenProvider.generateAccessToken(user.getUserId());

        // 11. 새 Refresh Token 발급
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user.getUserId());

        // 12. 새 Refresh Token 해시 생성
        String newRefreshTokenHash = hashToken(newRefreshToken);

        // 13. 새 Refresh Token DB 저장
        refreshTokenRepository.save(
                RefreshToken.create(
                        user,
                        newRefreshTokenHash,
                        jwtTokenProvider.extractExpiration(newRefreshToken)
                )
        );

        // 14. 새 토큰 응답
        return new ReissueResponse(newAccessToken, newRefreshToken);
    }
}
