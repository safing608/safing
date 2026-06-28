package com.safing.backend.auth.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
@lombok.extern.slf4j.Slf4j
public class JwtTokenProvider {

    // application.yml의 jwt 설정값을 바인딩한 객체
    private final JwtProperties jwtProperties;

    // JWT 서명 및 검증에 사용할 비밀키 객체
    private final SecretKey secretKey;

    public JwtTokenProvider(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;

        // .env에서 읽어온 Base64 Secret Key를 디코딩
        byte[] keyBytes = Decoders.BASE64.decode(jwtProperties.getSecret());

        // 디코딩된 바이트 배열을 HMAC-SHA 알고리즘용 SecretKey로 변환
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Access Token 생성
     * - 클라이언트가 인증이 필요한 API를 호출할 때 사용하는 토큰
     * - 만료 기간이 짧음
     */
    public String generateAccessToken(Long userId){
        return generateToken(userId, jwtProperties.getAccessTokenExpiration());
    }

    /**
     * Refresh Token 생성
     * - Access Token이 만료되었을 때 새 Access Token을 발급받기 위한 토큰
     * - 만료 기간이 Access Token보다 길다
     */
    public String generateRefreshToken(Long userId){
        return generateToken(userId, jwtProperties.getRefreshTokenExpiration());
    }


    /**
     * Access Token / Refresh Token 생성 공통 메서드
     *
     * @param userId 토큰의 subject로 저장할 사용자 ID
     * @param expirationMillis 토큰 만료 시간(ms)
     */
    private String generateToken(Long userId, long expirationMillis){
        Date now = new Date();
        Date expiration = new Date(now.getTime() + expirationMillis); // 현재시간 + 만료기간

        return Jwts.builder()
                // sub(subject) : 토큰의 주체 (사용자 ID)
                .subject(String.valueOf(userId))

                // iat(issued at): 토큰 발급 시간
                .issuedAt(now)

                // exp(expiration): 토큰 만료 시간
                .expiration(expiration)

                // SecretKey로 서명. 서명을 통해 토큰 위변조 여부 검증.
                .signWith(secretKey)

                // JWT 문자열 생성
                .compact();
    }

    /**
     * 토큰 유효성 검증
     * - 서명, 토큰 형식, 만료 여부 검사
     */
    public boolean validateToken(String token){
        try{
            Jwts.parser()
                    // 검증에 사용할 SecretKey 설정
                    .verifyWith(secretKey)

                    // Parser 생성
                    .build()

                    // 토큰 파싱 및 검증
                    .parseSignedClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("만료된 JWT 토큰입니다.", e);

        } catch (SecurityException e) {
            log.warn("잘못된 JWT 서명입니다.", e);

        } catch (MalformedJwtException e) {
            log.warn("손상된 JWT 토큰입니다.", e);

        } catch (UnsupportedJwtException e) {
            log.warn("지원하지 않는 JWT 토큰입니다.", e);

        } catch (IllegalArgumentException e) {
            log.warn("JWT 토큰이 비어있습니다.", e);
        }
        return false;
    }

    /**
     * 토큰의 Claims(payload)를 추출하는 메서드
     * - subject, issuedAt, expiration같은 정보를 읽을 때 사용
     */
    public Claims getClaims(String token){
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * 토큰에서 사용자 ID 추출
     * - JWT subject에 저장해둔 userId를 Long으로 변환해 반환
     */
    public long getUserId(String token){
        Claims claims = getClaims(token);
        return Long.valueOf(claims.getSubject());
    }
}
