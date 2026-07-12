package com.safing.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient aiWebClient(
            WebClient.Builder builder,
            @Value("${ai.server.base-url}") String aiServerBaseUrl
    ) {
        return builder.baseUrl(aiServerBaseUrl).build();
    }
}
