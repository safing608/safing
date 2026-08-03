package com.safing.backend.chat.dto.sse.ai;

import java.util.List;

public record AiFinalAnswerEventData(
        String title,
        String answer,
        List<Source> sources
) {
    public record Source(
            Long sourceId,
            Long chunkId,
            String documentName
    )
    {
    }
}
