package com.safing.backend.chat.client;

import com.safing.backend.chat.dto.sse.ai.AiChatRequest;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

@Component
public class AiChatClient {

    private final WebClient aiWebClient;

    public AiChatClient(@Qualifier("aiWebClient") WebClient aiWebClient) {
        this.aiWebClient = aiWebClient;
    }

    public Flux<ServerSentEvent<String>> streamChat(AiChatRequest request) {
        return aiWebClient.post()
                .uri("/api/v1/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.TEXT_EVENT_STREAM)
                .bodyValue(request)
                .retrieve()
                .bodyToFlux(new ParameterizedTypeReference<ServerSentEvent<String>>() {});
    }
}
