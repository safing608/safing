package com.safing.backend.chat.repository;

import com.safing.backend.chat.entity.ChatSession;
import com.safing.backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {

    // 특정 사용자의 삭제되지 않은 채팅방 목록을 updatedAt 내림차순으로 조회 (목록 조회)
    List<ChatSession> findByUserAndDeletedFalseOrderByUpdatedAtDesc(User user);

    // 특정 사용자의 특정 채팅방을 조회하되, 삭제된 채팅방은 제외 (소유권 검증)
    Optional<ChatSession> findBySessionIdAndUserAndDeletedFalse(Long sessionId, User user);
}
