from pathlib import Path
from typing import Any

from pydantic import BaseModel, Field


class DocumentPage(BaseModel):
    page_number: int
    text: str


class DocumentMetadata(BaseModel):
    source_title: str
    provider: str
    category: str
    document_type: str = "pdf"
    source_path: str
    language: str = "ko"

    @classmethod
    def from_file(
        cls,
        file_path: str | Path,
        source_title: str,
        provider: str,
        category: str,
        document_type: str = "pdf",
        language: str = "ko",
    ) -> "DocumentMetadata":
        return cls(
            source_title=source_title,
            provider=provider,
            category=category,
            document_type=document_type,
            source_path=str(Path(file_path)),
            language=language,
        )


class RagChunk(BaseModel):
    source_title: str
    provider: str
    category: str
    document_type: str = "pdf"
    source_path: str
    language: str = "ko"
    content: str
    chunk_index: int
    page_start: int | None = None
    page_end: int | None = None
    risk_codes: list[str] = Field(default_factory=list)
    parent_risk_codes: list[str] = Field(default_factory=list)
    risk_types: list[str] = Field(default_factory=list)
    parent_risk_types: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)


class EmbeddedRagChunk(RagChunk):
    embedding: list[float]
