package com.safing.backend.chat.dto.sse.frontend;

public record CompleteEventData(
        String title,
        String riskTypeCode,
        String riskTypeName,
        String answer
) {
}
