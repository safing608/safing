package com.safing.backend.chat.repository;

import com.safing.backend.chat.entity.ChatMessage;
import com.safing.backend.chat.entity.ChatSession;
import com.safing.backend.chat.enumtype.ChatMessageRole;
import com.safing.backend.chat.enumtype.ChatMessageStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // 대화 상세 조회: 특정 채팅방의 모든 메시지를 생성순으로 조회
    List<ChatMessage> findBySessionOrderByCreatedAtAsc(ChatSession session);

    // 실제로 해당 세션에 있는 메시지인지 검증: 특정 채팅방 안에 있는 특정 메시지 조회
    Optional<ChatMessage> findByMessageIdAndSession(Long messageId, ChatSession session);

    // SSE 스트림 조회 : 특정 채팅방 안에서 특정 역할의 메시지 조회
    Optional<ChatMessage> findByMessageIdAndSessionAndRole(
            Long messageId,
            ChatSession session,
            ChatMessageRole role
    );

    // 재전송 : 특정 채팅방 안에서 특정 역할과 상태를 가진 메시지 조회
    Optional<ChatMessage> findByMessageIdAndSessionAndRoleAndStatus(
            Long messageId,
            ChatSession session,
            ChatMessageRole role,
            ChatMessageStatus status
    );

    // parentMessageId와 role로 조회 => 특정 USER 메시지에 대한 ASSISTANT 메시지가 이미 존재하는지 조회하기 위함
    boolean existsByParentMessage_MessageIdAndRole(
            Long parentMessageId,
            ChatMessageRole role
    );
}
