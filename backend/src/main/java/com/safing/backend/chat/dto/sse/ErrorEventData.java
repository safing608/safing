package com.safing.backend.chat.dto.sse;

public record ErrorEventData(
        String code,
        String message,
        Long sessionId,
        Long messageID
) {
}
