package com.safing.backend.chat.dto.sse;

public record RiskTypeEventData(
        String riskTypeCode,
        String riskTypeName
) {
}
