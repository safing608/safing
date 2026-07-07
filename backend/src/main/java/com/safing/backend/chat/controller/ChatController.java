package com.safing.backend.chat.controller;

import com.safing.backend.auth.security.AuthUser;
import com.safing.backend.chat.dto.request.CreateChatRequest;
import com.safing.backend.chat.dto.request.SendChatMessageRequest;
import com.safing.backend.chat.dto.response.CreateChatResponse;
import com.safing.backend.chat.dto.response.SendChatMessageResponse;
import com.safing.backend.chat.service.ChatService;
import com.safing.backend.chat.service.ChatStreamService;
import com.safing.backend.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final ChatStreamService chatStreamService;

    /**
     * 새 채팅방 생성 API
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CreateChatResponse>> createChat(
            @AuthenticationPrincipal AuthUser authUser,
            @Valid @RequestBody CreateChatRequest request
    ){
        CreateChatResponse response = chatService.createChat(authUser.userId(), request.content());
        return ResponseEntity.ok(
                ApiResponse.success("질문이 접수되었습니다.", response)
        );
    }

    /**
     * 기존 대화에 질문 전송 API
     */
    @PostMapping("/{sessionId}/messages")
    public ResponseEntity<ApiResponse<SendChatMessageResponse>> sendChatMessage (
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long sessionId,
            @Valid @RequestBody SendChatMessageRequest request
    ){
        SendChatMessageResponse response = chatService.sendChatMessage(authUser.userId(), sessionId, request.content());
        return ResponseEntity.ok(
                ApiResponse.success("질문이 접수되었습니다.", response)
        );
    }

    /**
     * AI 답변 스트림 조회 API
     */
    @GetMapping(
            value = "/api/chats/{sessionId}/messages/{messageId}/stream",
            produces = MediaType.TEXT_EVENT_STREAM_VALUE // API 응답 형식 명시 (SSE API니까 이벤트 스트림 응답)
    )
    public SseEmitter streamAnswer(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long sessionId,
            @PathVariable Long messageId
    ){
        return chatStreamService.streamAnswer(authUser.userId(), sessionId, messageId);
    }
}
