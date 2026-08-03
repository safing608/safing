package com.safing.backend.chat.dto.request;

import jakarta.validation.constraints.NotBlank;

public record SendChatMessageRequest(

        @NotBlank(message = "질문 내용은 필수입니다.")
        String content
) {
}
