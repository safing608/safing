package com.safing.backend.chat.dto.sse.ai;

// 현재는 completed 고정값만 온다
public record AiDoneEventData(
        String status
) {
}
