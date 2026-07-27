from sqlalchemy.orm import Session

from app.db.repositories.document_search_repository import DocumentSearchRepository
from app.db.session import SessionLocal
from app.schemas.chat import RetrievedChunk, SafetyChatState
from app.services.embedding_service import EmbeddingService


class RagSearchAgent:
    name = "rag_searcher"

    def __init__(
        self,
        embedding_service: EmbeddingService | None = None,
        session: Session | None = None,
        top_k: int = 5,
        fallback_threshold: int = 3,
    ) -> None:
        self.embedding_service = embedding_service or EmbeddingService()
        self.session = session
        self._owns_session = session is None
        self.top_k = top_k
        self.fallback_threshold = fallback_threshold

    async def run(self, state: SafetyChatState) -> SafetyChatState:
        query = state.normalized_message or state.message
        query_embedding = self.embedding_service.embed_text(query)
        session = self.session or SessionLocal()

        try:
            repository = DocumentSearchRepository(session)
            chunks = self.search(repository, state, query_embedding)
            state.retrieved_chunks = chunks
            state.sources = [chunk.source for chunk in chunks]
            return state
        finally:
            if self._owns_session:
                session.close()

    def search(
        self,
        repository: DocumentSearchRepository,
        state: SafetyChatState,
        query_embedding: list[float],
    ) -> list[RetrievedChunk]:
        if state.risk_classification is None:
            return repository.search_global(query_embedding, self.top_k)

        results: list[RetrievedChunk] = []
        seen_chunk_ids: set[int] = set()
        risk_code = state.risk_classification.risk_code
        parent_risk_code = state.risk_classification.parent_risk_code

        if risk_code != "Z":
            results.extend(
                repository.search_by_risk_code(
                    query_embedding=query_embedding,
                    risk_code=risk_code,
                    top_k=self.top_k,
                )
            )
            seen_chunk_ids.update(chunk.id for chunk in results)

        if len(results) < self.fallback_threshold and parent_risk_code != "Z":
            parent_results = repository.search_by_parent_risk_code(
                query_embedding=query_embedding,
                parent_risk_code=parent_risk_code,
                top_k=self.top_k - len(results),
                exclude_chunk_ids=seen_chunk_ids,
            )
            results.extend(parent_results)
            seen_chunk_ids.update(chunk.id for chunk in parent_results)

        if len(results) < self.fallback_threshold:
            global_results = repository.search_global(
                query_embedding=query_embedding,
                top_k=self.top_k - len(results),
                exclude_chunk_ids=seen_chunk_ids,
            )
            results.extend(global_results)

        return results[: self.top_k]
