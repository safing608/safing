package com.safing.backend.chat.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "message_sources")
public class MessageSource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "source_id")
    private Long sourceId;

    @Column(name = "ai_source_id", nullable = false)
    private Long aiSourceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id", nullable = false)
    private ChatMessage message;

    @Column(name = "document_name", nullable = false, length = 500)
    private String documentName;

    @Column(name = "chunk_id", nullable = false)
    private Long chunkId;

    /**
     * 메시지 출처 생성
     */
    public static MessageSource create(
            ChatMessage message,
            Long aiSourceId,
            Long chunkId,
            String documentName
    ) {
        MessageSource source = new MessageSource();
        source.message = message;
        source.aiSourceId = aiSourceId;
        source.chunkId = chunkId;
        source.documentName = documentName;
        return source;
    }
}
