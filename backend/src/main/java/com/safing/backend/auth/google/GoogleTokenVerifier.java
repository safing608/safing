package com.safing.backend.auth.google;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class GoogleTokenVerifier {

    // 생성 시점에 1회 초기화한 뒤 재사용하는 Google ID Token 검증기
    private final GoogleIdTokenVerifier verifier; // 생성 시점에 1회 초기화할 검증기 객체

    // 생성자를 통해 의존성 주입 및 검증기 사전 빌드 진행
    public GoogleTokenVerifier(GoogleOAuthProperties googleOAuthProperties) {
        this.verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance()
        )
                .setAudience(Collections.singletonList(googleOAuthProperties.getClientId()))
                .build();
    }

    /**
     * 프론트엔드가 전달한 Google ID Token을 검증하고,
     * 검증에 성공하면 Google 사용자 정보를 담은 Payload를 반환
     */
    public GoogleIdToken.Payload verify(String idToken){
        try{
            // 서명, 만료 시간, audience 등을 검증
            GoogleIdToken googleIdToken = verifier.verify(idToken);

            if (googleIdToken == null){
                throw new IllegalArgumentException("유효하지 않은 Google ID Token 입니다.");
            }
            return googleIdToken.getPayload();

        } catch (Exception e) {
            throw new IllegalArgumentException("Google ID token 검증에 실패했습니다.");
        }
    }
}
