from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import DocumentSource
from app.schemas.rag import DocumentMetadata


class DocumentSourceRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get_or_create(self, metadata: DocumentMetadata) -> DocumentSource:
        source = self.session.scalar(
            select(DocumentSource).where(DocumentSource.source_path == metadata.source_path)
        )
        if source is not None:
            return source

        source = DocumentSource(
            source_title=metadata.source_title,
            provider=metadata.provider,
            category=metadata.category,
            document_type=metadata.document_type,
            source_path=metadata.source_path,
            language=metadata.language,
        )
        self.session.add(source)
        self.session.flush()
        return source
