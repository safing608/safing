package com.safing.backend.chat.service;

import com.safing.backend.chat.dto.response.CreateChatResponse;
import com.safing.backend.chat.dto.response.SendChatMessageResponse;
import com.safing.backend.chat.entity.ChatMessage;
import com.safing.backend.chat.entity.ChatSession;
import com.safing.backend.chat.repository.ChatMessageRepository;
import com.safing.backend.chat.repository.ChatSessionRepository;
import com.safing.backend.chat.repository.MessageSourceRepository;
import com.safing.backend.chat.repository.RiskTypeRepository;
import com.safing.backend.common.enumtype.ResponseCode;
import com.safing.backend.common.exception.CustomException;
import com.safing.backend.user.entity.User;
import com.safing.backend.user.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatSessionRepository chatSessionRepository;

    private final ChatMessageRepository chatMessageRepository;

    private final MessageSourceRepository messageSourceRepository;

    private final RiskTypeRepository riskTypeRepository;

    private final UserRepository userRepository;

    /**
     * 새 채팅방 생성
     */
    @Transactional
    public CreateChatResponse createChat(Long userId, String content){
        // 1. userId로 User 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 2. chat_sessions INSERT
        ChatSession chatSession = ChatSession.create(user);
        chatSessionRepository.save(chatSession);

        // 3. chat_messages INSERT - USER 메시지
        ChatMessage userMessage = ChatMessage.createUserMessage(chatSession, content);
        chatMessageRepository.save(userMessage);

        // 4. chat_messages INSERT - ASSISTANT 메시지
        ChatMessage assistantMessage = ChatMessage.createAssistantMessage(chatSession, userMessage, user.getCountryCode());
        chatMessageRepository.save(assistantMessage);

        // 5. 응답 반환
        return new CreateChatResponse(chatSession.getSessionId(), assistantMessage.getMessageId());
    }

    /**
     * 기존 대화에 질문 전송
     */
    @Transactional
    public SendChatMessageResponse sendChatMessage(Long userId, Long sessionId, String content){

        // 1. sessionId, userId로 기존 chat_session 조회 (삭제 여부도 검증)
        ChatSession chatSession = chatSessionRepository
                .findBySessionIdAndUser_UserIdAndDeletedFalse(sessionId, userId)
                .orElseThrow(() -> new CustomException(ResponseCode.SESSION_NOT_FOUND));

        // 2. chat_messages INSERT - USER 메시지
        ChatMessage userMessage = ChatMessage.createUserMessage(chatSession, content);
        chatMessageRepository.save(userMessage);

        // 3. chat_messages INSERT - ASSISTANT 메시지
        ChatMessage assistantMessage = ChatMessage.createAssistantMessage(chatSession, userMessage, chatSession.getUser().getCountryCode());
        chatMessageRepository.save(assistantMessage);

        // 4. session.updatedAt 갱신
        chatSession.updateUpdatedAt();

        // 5. 응답 반환
        return new SendChatMessageResponse(assistantMessage.getMessageId());
    }
}
