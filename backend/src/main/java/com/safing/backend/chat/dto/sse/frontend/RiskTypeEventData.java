package com.safing.backend.chat.dto.sse.frontend;

public record RiskTypeEventData(
        String riskTypeCode,
        String riskTypeName
) {
}
