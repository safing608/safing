package com.safing.backend.user.entity;

import com.safing.backend.common.enumtype.CountryCode;
import com.safing.backend.common.enumtype.OAuthProvider;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;


@Entity // Java객체를 DB 테이블과 연결
@Table(name = "users") // 어떤 테이블과 연결할지 지정
@Getter // getter 자동 생성
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 기본 생성자 생성 // 외부에서 생성 못하게 protect
@AllArgsConstructor // 모든 필드를 받는 생성자 생성
@Builder
public class User {
    @Id // PK
    @GeneratedValue(strategy = GenerationType.IDENTITY) // PK를 db가 생성
    @Column(name = "user_id") // 컬럼과 필드 연결
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "oauth_provider", nullable = false)
    private OAuthProvider oauthProvider;

    @Column(name = "oauth_id", nullable = false)
    private String oauthId;

    @Column(nullable = false)
    private String username;

    @Enumerated(EnumType.STRING)
    @Column(name = "country_code", nullable = false)
    private CountryCode countryCode;

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private boolean deleted = false;

    @CreationTimestamp // Hibernate가 자동으로 insert시점 시각을 넣어줌
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    /**
     * Google OAuth를 통해 최초 로그인한 사용자를 생성한다.
     * userId와 생성/수정 시간은 JPA(Hibernate)가 자동으로 설정한다.
     */
    public static User createGoogleUser(String oauthId, String username, CountryCode countryCode) {
        return User.builder()
                .oauthProvider(OAuthProvider.GOOGLE)
                .oauthId(oauthId)
                .username(username)
                .countryCode(countryCode)
                .build();
    }
}
