package com.safing.backend.auth.dto.response;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SignupRequiredGoogleAuthResponseTest {

    @Test
    void status는_SIGNUP_REQUIRED로_포함되고_message는_JSON에서_제외되어야_한다() throws Exception {
        // given
        SignupRequiredGoogleAuthResponse response = SignupRequiredGoogleAuthResponse.signupRequired();

        // when
        ObjectMapper objectMapper = new ObjectMapper();
        String json = objectMapper.writeValueAsString(response);

        // then
        System.out.println(json);
        assertThat(json).contains("\"status\":\"SIGNUP_REQUIRED\"");
        assertThat(json).doesNotContain("\"message\"");
    }
}