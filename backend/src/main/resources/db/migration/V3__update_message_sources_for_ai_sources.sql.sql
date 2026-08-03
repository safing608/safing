-- AI 서버 출처 식별자 저장 컬럼 추가
ALTER TABLE message_sources
    ADD COLUMN ai_source_id BIGINT;

-- chunk_id 타입을 BIGINT로 변경
ALTER TABLE message_sources
ALTER COLUMN chunk_id TYPE BIGINT
    USING chunk_id::BIGINT;

-- ai_source_id 컬럼에 not null 제약 추가
ALTER TABLE message_sources
    ALTER COLUMN ai_source_id SET NOT NULL;