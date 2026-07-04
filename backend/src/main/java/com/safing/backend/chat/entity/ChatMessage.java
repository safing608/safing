package com.safing.backend.chat.entity;

import com.safing.backend.chat.enumtype.ChatMessageRole;
import com.safing.backend.chat.enumtype.ChatMessageStatus;
import com.safing.backend.common.enumtype.CountryCode;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "chat_messages")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    private Long messageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private ChatSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "risk_type_id")
    private RiskType riskType;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_message_id")
    private ChatMessage parentMessage;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private ChatMessageRole role;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "country_code", length = 10)
    private CountryCode countryCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ChatMessageStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * User 메시지 생성
     */
    public static ChatMessage createUserMessage(
            ChatSession session,
            String content
    ) {
        ChatMessage message = new ChatMessage();
        LocalDateTime now = LocalDateTime.now();

        message.session = session;
        message.role = ChatMessageRole.USER;
        message.content = content;
        message.countryCode = null;
        message.status = ChatMessageStatus.COMPLETED;
        message.createdAt = now;
        message.updatedAt = now;

        return message;
    }

    /**
     * Assistant 메시지 생성
     */
    public static ChatMessage createAssistantMessage(
            ChatSession session,
            ChatMessage parentMessage,
            CountryCode countryCode
    ) {
        if (parentMessage == null || parentMessage.getRole() != ChatMessageRole.USER) {
            throw new IllegalArgumentException("ASSISTANT 메시지의 부모 메시지는 USER 메시지여야 합니다.");
        }
        ChatMessage message = new ChatMessage();
        LocalDateTime now = LocalDateTime.now();

        message.session = session;
        message.parentMessage = parentMessage;
        message.role = ChatMessageRole.ASSISTANT;
        message.content = "";
        message.status = ChatMessageStatus.PROCESSING;
        message.countryCode = countryCode;
        message.createdAt = now;
        message.updatedAt = now;

        return message;
    }

}
