package com.safing.backend.auth.entity;
import com.safing.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "refresh_tokens")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "refresh_token_id")
    private Long refreshTokenId;

    @ManyToOne(fetch = FetchType.LAZY) // 여러개의 RefreshToken - 하나의 User (여러 기기에서 로그인 가능)
    // FetchType.LAZY => 처음에는 RefreshToken만 조회. 필요할때 token.getUser()를 호출하면 그때 User 조회
    // FetchType.EAGER => 바로 User까지 조회
    @JoinColumn(name = "user_id", nullable = false) // 이 엔티티의 user 필드는 refresh_token.user_id 컬럼과 연결된다
    private User user;

    @Column(name = "token_hash", nullable = false, unique = true)
    private String tokenHash;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "expired_at", nullable =false)
    private LocalDateTime expiredAt;

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    // 로그아웃
    public void revoke() {
        this.revokedAt = LocalDateTime.now();
    }

    // 사용 가능한 토큰인지 검증 (폐기되지 않았고, 만료 시간도 지나지 않음)
    public boolean isValid() {
        return revokedAt == null && !expiredAt.isBefore(LocalDateTime.now());
    }


}
