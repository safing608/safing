package com.safing.backend.chat.dto.sse.ai;

public record AiErrorEventData(
        String code,
        String message
) {
}
