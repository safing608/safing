package com.safing.backend.chat.service;

import com.safing.backend.chat.dto.response.*;
import com.safing.backend.chat.entity.ChatMessage;
import com.safing.backend.chat.entity.ChatSession;
import com.safing.backend.chat.enumtype.ChatMessageRole;
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

import java.util.ArrayList;
import java.util.List;

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
        chatSession.touch();

        // 5. 응답 반환
        return new SendChatMessageResponse(assistantMessage.getMessageId());
    }

    /**
     * 대화 목록 조회
     */
    @Transactional(readOnly = true)
    public List<ChatListResponse> getChatList(Long userId){

        return chatSessionRepository
                .findAllByUser_UserIdAndDeletedFalseOrderByUpdatedAtDesc(userId)
                .stream()
                .map(chatSession -> new ChatListResponse(
                        chatSession.getSessionId(),
                        chatSession.getTitle()
                ))
                .toList();
    }

    /**
     * 대화 상세 조회
     */
    @Transactional(readOnly = true)
    public List<ChatDetailResponse> getChatDetail(Long userId, Long sessionId){

        // 1. 해당 사용자의 대화방인지, 삭제되지 않았는지 검증
        chatSessionRepository
                .findBySessionIdAndUser_UserIdAndDeletedFalse(sessionId, userId)
                .orElseThrow(() -> new CustomException(ResponseCode.SESSION_NOT_FOUND));

        // 2. 검증된 대화방의 모든 대화 조회
        return chatMessageRepository
                .findAllBySession_SessionIdOrderByCreatedAtAsc(sessionId)
                .stream()
                .map( message -> new ChatDetailResponse(
                        message.getMessageId(),
                        message.getStatus(),
                        message.getRole(),
                        message.getContent(),
                        message.getRiskType() != null
                                ? message.getRiskType().getRiskTypeCode()
                                :null,
                        resolveRiskTypeName(message)
                ))
                .toList();
    }

    /**
     * 대화 상세 조회 시 위험유형명 국가별 매핑
     */
    private String resolveRiskTypeName(ChatMessage message){

        // USER 메시지는 위험 유형을 갖지 않음
        if (message.getRole() == ChatMessageRole.USER) {
            return null;
        }

        // 답변 생성 중이거나 실패한 경우 위험 유형이 없을 수 있음
        if (message.getRiskType() == null || message.getCountryCode() == null) {
            return null;
        }

        return message.getRiskType()
                .getNameByCountryCode(message.getCountryCode());
    }

    /**
     * 대화방 삭제
     */
    @Transactional
    public void deleteChatSession(Long userId, Long sessionId){
        ChatSession chatSession = chatSessionRepository
                .findBySessionIdAndUser_UserIdAndDeletedFalse(sessionId, userId)
                .orElseThrow(() ->
                        new CustomException(ResponseCode.SESSION_NOT_FOUND)
                );
        chatSession.delete();
    }

    /**
     * 질문 재전송
     */
    @Transactional
    public RetryMessageResponse retryMessage(Long userId, Long sessionId, Long messageId){
        ChatMessage message = chatMessageRepository
                .findRetryTarget(messageId, sessionId, userId)
                .orElseThrow(() ->
                        new CustomException(ResponseCode.MESSAGE_NOT_FOUND)
                );

        message.retryAssistantAnswer();

        return new RetryMessageResponse(message.getMessageId());
    }
}
