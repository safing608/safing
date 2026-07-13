package com.safing.backend.chat.dto.sse.ai;

public record AiChatRequest(
        String message,
        String targetLanguage,
        Long sessionId
) {
}
