package com.safing.backend.chat.service;

import com.safing.backend.chat.entity.ChatSession;
import com.safing.backend.chat.repository.ChatMessageRepository;
import com.safing.backend.chat.repository.ChatSessionRepository;
import com.safing.backend.chat.repository.RiskTypeRepository;
import com.safing.backend.common.enumtype.ResponseCode;
import com.safing.backend.common.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
@RequiredArgsConstructor
public class ChatStreamService {

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final RiskTypeRepository riskTypeRepository;

    public SseEmitter streamAnswer(Long userId, Long sessionId, Long messageId) {
        // 1. 세션 검증
        ChatSession session = chatSessionRepository
                .findBySessionIdAndUser_UserIdAndDeletedFalse(sessionId, userId)
                .orElseThrow(() -> new CustomException(ResponseCode.SESSION_NOT_FOUND));

        // 2. 메시지 검증


        // 3. 상태 검증

        // 4. SseEmitter 생성 (60초 타임아웃)
        SseEmitter emitter = new SseEmitter(60_000L);



        return emitter;
    }

}
