from pathlib import Path

from app.rag.chunker import DocumentChunker
from app.rag.document_loader import load_pdf_pages
from app.rag.risk_tagger import RiskTagger
from app.rag.text_cleaner import TextCleaner
from app.schemas.rag import DocumentMetadata, EmbeddedRagChunk, RagChunk
from app.services.embedding_service import EmbeddingService


class RagIndexBuilder:
    def __init__(
        self,
        text_cleaner: TextCleaner | None = None,
        chunker: DocumentChunker | None = None,
        risk_tagger: RiskTagger | None = None,
        embedding_service: EmbeddingService | None = None,
        vector_store: object | None = None,
        use_llm_risk_correction: bool = True,
    ) -> None:
        self.text_cleaner = text_cleaner or TextCleaner()
        self.chunker = chunker or DocumentChunker()
        self.risk_tagger = risk_tagger or RiskTagger(use_llm=use_llm_risk_correction)
        self.embedding_service = embedding_service or EmbeddingService()
        self.vector_store = vector_store

    def build_chunks(
        self,
        file_path: str | Path,
        source_title: str,
        provider: str,
        category: str,
        document_type: str = "pdf",
        language: str = "ko",
    ) -> tuple[DocumentMetadata, list[EmbeddedRagChunk]]:
        metadata = DocumentMetadata.from_file(
            file_path=file_path,
            source_title=source_title,
            provider=provider,
            category=category,
            document_type=document_type,
            language=language,
        )
        pages = load_pdf_pages(file_path)
        cleaned_pages = [
            page.model_copy(update={"text": self.text_cleaner.clean(page.text)})
            for page in pages
        ]
        chunks = self.chunker.split_pages(cleaned_pages, metadata)
        tagged_chunks = self.risk_tagger.tag_chunks(chunks)
        embedded_chunks = self._embed_chunks(tagged_chunks)
        return metadata, embedded_chunks

    def build_and_save(
        self,
        file_path: str | Path,
        source_title: str,
        provider: str,
        category: str,
        document_type: str = "pdf",
        language: str = "ko",
        dry_run: bool = True,
    ) -> tuple[DocumentMetadata, list[EmbeddedRagChunk], list[int]]:
        metadata, chunks = self.build_chunks(
            file_path=file_path,
            source_title=source_title,
            provider=provider,
            category=category,
            document_type=document_type,
            language=language,
        )
        if dry_run:
            return metadata, chunks, []

        vector_store = self.vector_store or self._create_vector_store()
        chunk_ids = vector_store.save_chunks(metadata, chunks)
        return metadata, chunks, chunk_ids

    def _embed_chunks(self, chunks: list[RagChunk]) -> list[EmbeddedRagChunk]:
        embeddings = self.embedding_service.embed_texts([chunk.content for chunk in chunks])
        return [
            EmbeddedRagChunk(**chunk.model_dump(), embedding=embedding)
            for chunk, embedding in zip(chunks, embeddings, strict=True)
        ]

    def _create_vector_store(self):
        from app.rag.vector_store import VectorStore

        return VectorStore()


def build_document_chunks(
    file_path: str | Path,
    source_title: str,
    provider: str,
    risk_type: str | None = None,
) -> list[dict[str, object]]:
    category = risk_type or "산업 안전"
    _, chunks = RagIndexBuilder().build_chunks(
        file_path=file_path,
        source_title=source_title,
        provider=provider,
        category=category,
    )
    return [
        {
            "id": f"{Path(file_path).stem}-c{chunk.chunk_index}",
            "text": chunk.content,
            "metadata": chunk.model_dump(
                exclude={"content", "embedding"},
                by_alias=True,
            ),
        }
        for chunk in chunks
    ]
