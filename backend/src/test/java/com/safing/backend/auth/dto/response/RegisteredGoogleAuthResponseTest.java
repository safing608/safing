package com.safing.backend.auth.dto.response;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class RegisteredGoogleAuthResponseTest {

    @Test
    void 인터페이스에_붙인_JsonProperty도_적용되어야_한다() throws Exception {
        RegisteredGoogleAuthResponse response =
                RegisteredGoogleAuthResponse.registered(1L, "access-token", "refresh-token");

        ObjectMapper objectMapper = new ObjectMapper();
        String json = objectMapper.writeValueAsString(response);

        System.out.println(json);
        assertThat(json).contains("\"status\":\"REGISTERED\"");
    }
}