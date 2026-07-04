package com.safing.backend.chat.controller;

import com.safing.backend.auth.security.AuthUser;
import com.safing.backend.chat.dto.request.CreateChatRequest;
import com.safing.backend.chat.dto.response.CreateChatResponse;
import com.safing.backend.chat.service.ChatService;
import com.safing.backend.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

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
}
