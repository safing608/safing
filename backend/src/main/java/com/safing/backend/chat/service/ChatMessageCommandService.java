package com.safing.backend.chat.service;

import com.safing.backend.chat.entity.ChatMessage;
import com.safing.backend.chat.entity.ChatSession;
import com.safing.backend.chat.entity.RiskType;
import com.safing.backend.chat.enumtype.ChatMessageRole;
import com.safing.backend.chat.repository.ChatMessageRepository;
import com.safing.backend.chat.repository.ChatSessionRepository;
import com.safing.backend.chat.repository.RiskTypeRepository;
import com.safing.backend.common.enumtype.ResponseCode;
import com.safing.backend.common.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ChatMessageCommandService {
    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final RiskTypeRepository riskTypeRepository;

    @Transactional
    public void completeAssistantAnswer(Long sessionId, Long messageId, String title, String riskTypeCode, String answer) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new CustomException(ResponseCode.SESSION_NOT_FOUND));

        ChatMessage message = chatMessageRepository
                .findByMessageIdAndSessionAndRole(
                        messageId,
                        session,
                        ChatMessageRole.ASSISTANT)
                .orElseThrow(() -> new CustomException(ResponseCode.MESSAGE_NOT_FOUND));

        RiskType riskType = riskTypeRepository.findByRiskTypeCode(riskTypeCode)
                .orElseThrow(() -> new CustomException(ResponseCode.RISK_TYPE_NOT_FOUND));

        session.updateTitleIfAbsent(title);
        message.completeAssistantAnswer(riskType, answer);
    }

    @Transactional
    public void failAssistantAnswer(Long sessionId, Long messageId) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new CustomException(ResponseCode.SESSION_NOT_FOUND));

        ChatMessage message = chatMessageRepository
                .findByMessageIdAndSessionAndRole(
                        messageId,
                        session,
                        ChatMessageRole.ASSISTANT
                )
                .orElseThrow(() -> new CustomException(ResponseCode.MESSAGE_NOT_FOUND));

        message.failAssistantAnswer();
    }
}
