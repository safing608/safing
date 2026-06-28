package com.safing.backend.user.repository;

import com.safing.backend.common.enumtype.OAuthProvider;
import com.safing.backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * users 테이블에 접근하기 위한 Repository
 *
 * JpaRepository<User, Long>을 상속하면 기본 CRUD 메서드가 자동 제공
 * Long: User 엔티티의 PK인 userId의 타입
 */
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * OAuth 제공자와 OAuth 고유 ID로 사용자 조회.
     *
     * 로그인 시 Google idToken 검증 후 얻은 provider/id값을 기준으로 기존 사용자인지 확인.
     *
     * Optional<User> User가 있을수도, 없을수도 있음
     * findBy : SELECT ... WHERE
     * OauthProvider : User 엔티티의 oauthProvider 필드
     * AND : AND 조건
     * OauthId : User 엔티티의 oauthId 필드
     *
     * SELECT * FROM users WHERE oauth_provider = ? AND oauth_id = ?
     *
     */
    Optional<User> findByOauthProviderAndOauthId(OAuthProvider oauthProvider, String oauthId);

}
