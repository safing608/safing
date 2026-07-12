package com.safing.backend.chat.service;

import com.safing.backend.chat.dto.sse.ai.AiFinalAnswerEventData;
import com.safing.backend.chat.entity.ChatMessage;
import com.safing.backend.chat.entity.ChatSession;
import com.safing.backend.chat.entity.MessageSource;
import com.safing.backend.chat.entity.RiskType;
import com.safing.backend.chat.enumtype.ChatMessageRole;
import com.safing.backend.chat.repository.ChatMessageRepository;
import com.safing.backend.chat.repository.ChatSessionRepository;
import com.safing.backend.chat.repository.MessageSourceRepository;
import com.safing.backend.chat.repository.RiskTypeRepository;
import com.safing.backend.common.enumtype.ResponseCode;
import com.safing.backend.common.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatMessageCommandService {
    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final RiskTypeRepository riskTypeRepository;
    private final MessageSourceRepository messageSourceRepository;

    @Transactional
    public void completeAssistantAnswer(
            Long sessionId,
            Long messageId,
            String title,
            String riskTypeCode,
            String answer,
            List<AiFinalAnswerEventData.Source> sources
    ) {
        // 1. 대화방 가져오기
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new CustomException(ResponseCode.SESSION_NOT_FOUND));

        // 2. 메시지 가져오기
        ChatMessage message = chatMessageRepository
                .findByMessageIdAndSessionAndRole(
                        messageId,
                        session,
                        ChatMessageRole.ASSISTANT)
                .orElseThrow(() -> new CustomException(ResponseCode.MESSAGE_NOT_FOUND));

        // 3. riskType 가져오기
        RiskType riskType = riskTypeRepository.findByRiskTypeCode(riskTypeCode)
                .orElseThrow(() -> new CustomException(ResponseCode.RISK_TYPE_NOT_FOUND));

        // 4. 대화방 title 업데이트
        session.updateTitleIfAbsent(title);

        // 5. ASSISTANT 메시지 업데이트
        message.completeAssistantAnswer(riskType, answer);

        // 6. message_sources 인서트
        saveMessageSources(message, sources);
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

    /**
     * message_sources에 데이터를 저장하기 위한 메서드
     */
    private void saveMessageSources(
            ChatMessage message,
            List<AiFinalAnswerEventData.Source> sources
    ) {
        if (sources == null || sources.isEmpty()) {
            return;
        }

        List<MessageSource> messageSources = sources.stream()
                .map(source -> {
                    if (source.sourceId() == null
                            || source.chunkId() == null
                            || source.documentName() == null
                            || source.documentName().isBlank()) {
                        throw new CustomException(ResponseCode.AI_SERVER_ERROR);
                    }

                    return MessageSource.create(
                            message,
                            source.sourceId(),
                            source.chunkId(),
                            source.documentName()
                    );
                })
                .toList();

        messageSourceRepository.saveAll(messageSources);
    }
}
