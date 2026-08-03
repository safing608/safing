from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.schemas.rag import DocumentMetadata, DocumentPage, RagChunk


def split_text(text: str) -> list[str]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=120,
        separators=["\n\n", "\n", ".", " ", ""],
    )
    return splitter.split_text(text)


class DocumentChunker:
    def __init__(self, chunk_size: int = 800, chunk_overlap: int = 120) -> None:
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", ".", " ", ""],
        )

    def split_pages(
        self,
        pages: list[DocumentPage],
        metadata: DocumentMetadata,
    ) -> list[RagChunk]:
        chunks: list[RagChunk] = []

        for page in pages:
            page_chunks = self.splitter.split_text(page.text)
            for page_chunk_index, content in enumerate(page_chunks):
                chunks.append(
                    RagChunk(
                        source_title=metadata.source_title,
                        provider=metadata.provider,
                        category=metadata.category,
                        document_type=metadata.document_type,
                        source_path=metadata.source_path,
                        language=metadata.language,
                        content=content,
                        chunk_index=len(chunks),
                        page_start=page.page_number,
                        page_end=page.page_number,
                        metadata={"page_chunk_index": page_chunk_index},
                    )
                )

        return chunks
