package com.safing.backend.chat.dto.response;

import com.safing.backend.chat.enumtype.ChatMessageRole;
import com.safing.backend.chat.enumtype.ChatMessageStatus;

public record ChatDetailResponse(
        Long messageId,
        ChatMessageStatus status,
        ChatMessageRole role,
        String content,
        String riskTypeName
) {
}
