CREATE TABLE users (
                       user_id BIGSERIAL PRIMARY KEY,
                       oauth_provider VARCHAR(20) NOT NULL,
                       oauth_id VARCHAR(255) NOT NULL,
                       username VARCHAR(100) NOT NULL,
                       country_code VARCHAR(10) NOT NULL,
                       is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
                       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP,
                       deleted_at TIMESTAMP,

                       CONSTRAINT uk_users_oauth UNIQUE (oauth_provider, oauth_id),
                       CONSTRAINT chk_users_country_code CHECK (country_code IN ('KR', 'US', 'KH', 'VN', 'NP'))
);

CREATE TABLE refresh_tokens (
                                refresh_token_id BIGSERIAL PRIMARY KEY,
                                user_id BIGINT NOT NULL,
                                token_hash VARCHAR(255) NOT NULL,
                                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                expired_at TIMESTAMP NOT NULL,
                                revoked_at TIMESTAMP,

                                CONSTRAINT fk_refresh_tokens_user
                                    FOREIGN KEY (user_id)
                                        REFERENCES users(user_id),

                                CONSTRAINT uk_refresh_tokens_token_hash UNIQUE (token_hash)
);

CREATE TABLE chat_sessions (
                               session_id BIGSERIAL PRIMARY KEY,
                               user_id BIGINT NOT NULL,
                               title VARCHAR(255),
                               is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
                               deleted_at TIMESTAMP,
                               created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                               updated_at TIMESTAMP,

                               CONSTRAINT fk_chat_sessions_user
                                   FOREIGN KEY (user_id)
                                       REFERENCES users(user_id)
);

CREATE TABLE risk_types (
                            risk_type_id BIGSERIAL PRIMARY KEY,
                            risk_type_code VARCHAR(20) NOT NULL,
                            risk_type_name_ko VARCHAR(100) NOT NULL,
                            risk_type_name_en VARCHAR(100) NOT NULL,
                            risk_type_name_ne VARCHAR(100) NOT NULL,
                            risk_type_name_km VARCHAR(100) NOT NULL,
                            risk_type_name_vi VARCHAR(100) NOT NULL,

                            CONSTRAINT uk_risk_types_code UNIQUE (risk_type_code)
);

CREATE TABLE chat_messages (
                               message_id BIGSERIAL PRIMARY KEY,
                               session_id BIGINT NOT NULL,
                               risk_type_id BIGINT,
                               parent_message_id BIGINT,
                               role VARCHAR(20) NOT NULL,
                               content TEXT NOT NULL,
                               country_code VARCHAR(10),
                               status VARCHAR(20) NOT NULL,
                               created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                               updated_at TIMESTAMP,

                               CONSTRAINT fk_chat_messages_session
                                   FOREIGN KEY (session_id)
                                       REFERENCES chat_sessions(session_id),

                               CONSTRAINT fk_chat_messages_risk_type
                                   FOREIGN KEY (risk_type_id)
                                       REFERENCES risk_types(risk_type_id),

                               CONSTRAINT fk_chat_messages_parent_message
                                   FOREIGN KEY (parent_message_id)
                                       REFERENCES chat_messages(message_id),

                               CONSTRAINT chk_chat_messages_role
                                   CHECK (role IN ('USER', 'ASSISTANT')),

                               CONSTRAINT chk_chat_messages_status
                                   CHECK (status IN ('PROCESSING', 'COMPLETED', 'FAILED')),

                               CONSTRAINT chk_chat_messages_country_code
                                   CHECK (country_code IS NULL OR country_code IN ('KR', 'US', 'KH', 'VN', 'NP'))
);

CREATE TABLE message_sources (
                                 source_id BIGSERIAL PRIMARY KEY,
                                 message_id BIGINT NOT NULL,
                                 document_name VARCHAR(500) NOT NULL,
                                 chunk_id VARCHAR(255) NOT NULL,

                                 CONSTRAINT fk_message_sources_message
                                     FOREIGN KEY (message_id)
                                         REFERENCES chat_messages(message_id)
);

-- chat_sessions: 사용자별 세션 목록 조회용
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);

-- chat_messages: 특정 대화방에 들어갔을 때 메시지 전체 조회용
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);

-- chat_messages: 특정 USER 메시지에 대한 ASSISTANT 응답을 찾을 때
CREATE INDEX idx_chat_messages_user_message_id ON chat_messages(parent_message_id);

-- refresh_tokens: 사용자별 토큰 조회/무효화용
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);