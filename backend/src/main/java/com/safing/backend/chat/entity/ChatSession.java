package com.safing.backend.chat.entity;

import com.safing.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_sessions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "session_id")
    private Long sessionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "title", length = 255)
    private String title;

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 새 대화방 객체 생성
     */
    public static ChatSession create(User user) {
        ChatSession chatSession = new ChatSession();
        chatSession.user = user;

        LocalDateTime now = LocalDateTime.now();
        chatSession.createdAt = now;
        chatSession.updatedAt = now;

        return chatSession;
    }

    /**
     * 제목이 없는 경우 대화방 제목 설정
     */
    public void updateTitleIfAbsent(String title) {
        if (this.title == null || this.title.isBlank()) {
            this.title = title;
            this.updatedAt = LocalDateTime.now();
        }
    }

    /**
     * 대화방 최근 활동 시각 갱신
     */
    public void touch(){
        this.updatedAt = LocalDateTime.now();
    }


    /**
     * 대화방 소프트 삭제
     */
    public void delete() {
        LocalDateTime now = LocalDateTime.now();

        this.deleted = true;
        this.deletedAt = now;
        this.updatedAt = now;
    }
}
