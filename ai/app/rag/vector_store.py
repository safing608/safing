from sqlalchemy.orm import Session

from app.db.repositories.document_chunk_repository import DocumentChunkRepository
from app.db.repositories.document_source_repository import DocumentSourceRepository
from app.db.session import SessionLocal
from app.schemas.rag import DocumentMetadata, EmbeddedRagChunk


class VectorStore:
    def __init__(self, session: Session | None = None) -> None:
        self.session = session
        self._owns_session = session is None

    def save_chunks(
        self,
        metadata: DocumentMetadata,
        chunks: list[EmbeddedRagChunk],
    ) -> list[int]:
        session = self.session or SessionLocal()
        try:
            source = DocumentSourceRepository(session).get_or_create(metadata)
            chunk_repository = DocumentChunkRepository(session)
            chunk_ids = [chunk_repository.insert_chunk(source.id, chunk) for chunk in chunks]
            session.commit()
            return chunk_ids
        except Exception:
            session.rollback()
            raise
        finally:
            if self._owns_session:
                session.close()


def add_documents_to_vector_db(documents: list[EmbeddedRagChunk], metadata: DocumentMetadata) -> list[int]:
    return VectorStore().save_chunks(metadata, documents)
