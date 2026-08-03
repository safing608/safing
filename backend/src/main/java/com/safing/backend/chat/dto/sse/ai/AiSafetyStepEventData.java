package com.safing.backend.chat.dto.sse.ai;

public record AiSafetyStepEventData(
        int index,
        String text
) {
}
