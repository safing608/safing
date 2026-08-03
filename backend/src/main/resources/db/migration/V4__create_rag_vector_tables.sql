CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE document_sources (
    id BIGSERIAL PRIMARY KEY,
    source_title VARCHAR(255) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    document_type VARCHAR(50) NOT NULL DEFAULT 'pdf',
    source_path TEXT NOT NULL UNIQUE,
    language VARCHAR(10) NOT NULL DEFAULT 'ko',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE document_chunks (
    id BIGSERIAL PRIMARY KEY,
    source_id BIGINT NOT NULL REFERENCES document_sources(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    content_hash CHAR(64) NOT NULL UNIQUE,
    embedding VECTOR(1024) NOT NULL,
    chunk_index INTEGER NOT NULL,
    page_start INTEGER,
    page_end INTEGER,
    risk_codes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    risk_types TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_document_chunks_source_id
    ON document_chunks (source_id);

CREATE INDEX idx_document_chunks_risk_codes
    ON document_chunks USING GIN (risk_codes);

CREATE INDEX idx_document_chunks_risk_types
    ON document_chunks USING GIN (risk_types);

CREATE INDEX idx_document_chunks_metadata
    ON document_chunks USING GIN (metadata);

CREATE INDEX idx_document_chunks_embedding
    ON document_chunks USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
