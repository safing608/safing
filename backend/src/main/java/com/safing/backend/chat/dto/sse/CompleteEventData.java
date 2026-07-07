package com.safing.backend.chat.dto.sse;

public record CompleteEventData(
        String title,
        String riskTypeCode,
        String riskTypeName,
        String answer
) {
}
