package com.safing.backend.chat.dto.response;

public record CreateChatResponse(
        Long sessionId,
        Long messageId
) {
}
