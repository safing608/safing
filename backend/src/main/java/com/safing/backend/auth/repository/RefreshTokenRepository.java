package com.safing.backend.auth.repository;

import com.safing.backend.auth.entity.RefreshToken;
import com.safing.backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    // 토큰 해시값으로 리프레시토큰 조회
    Optional<RefreshToken> findByTokenHash(String tokenHash);

    // 특정 사용자의 모든 리프레시토큰 조회
    List<RefreshToken> findByUser(User user);

}
