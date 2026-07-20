import hashlib
import json

from sqlalchemy import Text, bindparam, text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Session

from app.schemas.rag import EmbeddedRagChunk


class DocumentChunkRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def insert_chunk(self, source_id: int, chunk: EmbeddedRagChunk) -> int:
        content_hash = self._content_hash(source_id, chunk.content)
        statement = text(
                """
                INSERT INTO document_chunks (
                    source_id,
                    content,
                    content_hash,
                    embedding,
                    chunk_index,
                    page_start,
                    page_end,
                    risk_codes,
                    parent_risk_codes,
                    risk_types,
                    parent_risk_types,
                    metadata
                )
                VALUES (
                    :source_id,
                    :content,
                    :content_hash,
                    CAST(:embedding AS vector),
                    :chunk_index,
                    :page_start,
                    :page_end,
                    :risk_codes,
                    :parent_risk_codes,
                    :risk_types,
                    :parent_risk_types,
                    CAST(:metadata AS jsonb)
                )
                ON CONFLICT (content_hash) DO NOTHING
                RETURNING id
                """
            ).bindparams(
                bindparam("risk_codes", type_=ARRAY(Text)),
                bindparam("parent_risk_codes", type_=ARRAY(Text)),
                bindparam("risk_types", type_=ARRAY(Text)),
                bindparam("parent_risk_types", type_=ARRAY(Text)),
            )
        result = self.session.execute(
            statement,
            {
                "source_id": source_id,
                "content": chunk.content,
                "content_hash": content_hash,
                "embedding": self._format_vector(chunk.embedding),
                "chunk_index": chunk.chunk_index,
                "page_start": chunk.page_start,
                "page_end": chunk.page_end,
                "risk_codes": chunk.risk_codes,
                "parent_risk_codes": chunk.parent_risk_codes,
                "risk_types": chunk.risk_types,
                "parent_risk_types": chunk.parent_risk_types,
                "metadata": json.dumps(chunk.metadata, ensure_ascii=False),
            },
        )
        row = result.first()
        return int(row.id) if row is not None else -1

    def _content_hash(self, source_id: int, content: str) -> str:
        value = f"{source_id}:{content}".encode("utf-8")
        return hashlib.sha256(value).hexdigest()

    def _format_vector(self, embedding: list[float]) -> str:
        return "[" + ",".join(str(value) for value in embedding) + "]"
