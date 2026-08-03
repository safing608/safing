package com.safing.backend.chat.repository;

import com.safing.backend.chat.entity.ChatMessage;
import com.safing.backend.chat.entity.MessageSource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageSourceRepository extends JpaRepository<MessageSource, Long> {

    // 특정 ASSISTANT 메시지에 연결된 출처 목록 조회
    List<MessageSource> findByMessage(ChatMessage message);
}
