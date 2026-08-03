package com.safing.backend.chat.dto.sse.frontend;

public record ErrorEventData(
        String code,
        String message,
        Long sessionId,
        Long messageID
) {
}
