package com.safing.backend.chat.repository;

import com.safing.backend.chat.entity.ChatMessage;
import com.safing.backend.chat.entity.ChatSession;
import com.safing.backend.chat.enumtype.ChatMessageRole;
import com.safing.backend.chat.enumtype.ChatMessageStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // 대화 상세 조회: 특정 채팅방의 모든 메시지를 생성순으로 조회
    List<ChatMessage> findAllBySession_SessionIdOrderByCreatedAtAsc(Long sessionId);

    // SSE 스트림 조회 : 특정 채팅방 안에서 특정 역할의 메시지 조회
    Optional<ChatMessage> findByMessageIdAndSessionAndRole(
            Long messageId,
            ChatSession session,
            ChatMessageRole role
    );

    /**
     * messageId, session, role로 ChatMessage를 조회하면서 parentMessage를 함께 로딩한다.
     *
     * ChatStreamService의 SSE 스트리밍은 별도 Executor 스레드에서 처리된다.
     * 이때 parentMessage를 지연 로딩(LAZY)에 맡기면,
     * 조회 이후 영속성 컨텍스트가 닫힌 상태에서 별도 스레드가 parentMessage에 접근할 수 있어
     * LazyInitializationException이 발생할 수 있다.
     *
     * 따라서 이 메서드는 @EntityGraph로 parentMessage를 즉시 로딩해 반환한다.
     */
    @EntityGraph(attributePaths = "parentMessage")
    Optional<ChatMessage> findWithParentByMessageIdAndSessionAndRole(
            Long messageId,
            ChatSession session,
            ChatMessageRole role
    );

    // messageId, sessionId, userId로 재시도할 메시지 조회
    @Query("""
        SELECT m
        FROM ChatMessage m
        JOIN m.session s
        WHERE m.messageId = :messageId
          AND s.sessionId = :sessionId
          AND s.user.userId = :userId
          AND s.deleted = false
        """)
    Optional<ChatMessage> findRetryTarget(
            @Param("messageId") Long messageId,
            @Param("sessionId") Long sessionId,
            @Param("userId") Long userId
    );

    // parentMessageId와 role로 조회 => 특정 USER 메시지에 대한 ASSISTANT 메시지가 이미 존재하는지 조회하기 위함
    boolean existsByParentMessage_MessageIdAndRole(
            Long parentMessageId,
            ChatMessageRole role
    );
}
