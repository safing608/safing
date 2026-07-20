ALTER TABLE document_chunks
    ADD COLUMN parent_risk_codes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN parent_risk_types TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

CREATE INDEX idx_document_chunks_parent_risk_codes
    ON document_chunks USING GIN (parent_risk_codes);

CREATE INDEX idx_document_chunks_parent_risk_types
    ON document_chunks USING GIN (parent_risk_types);
