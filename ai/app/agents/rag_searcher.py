import re

from sqlalchemy.orm import Session

from app.db.repositories.document_search_repository import DocumentSearchRepository
from app.db.session import SessionLocal
from app.schemas.chat import RetrievedChunk, SafetyChatState
from app.services.embedding_service import EmbeddingService


QUERY_STOPWORDS = {
    "관련",
    "발생",
    "사고",
    "상황",
    "안전",
    "위험",
    "작업",
}


RISK_RETRIEVAL_KEYWORDS = {
    "01": ("떨어짐", "추락", "고소", "사다리", "비계", "개구부", "난간", "안전대"),
    "02": ("넘어짐", "전도", "미끄러짐", "걸림", "바닥", "통로", "정리정돈"),
    "03": ("깔림", "뒤집힘", "전도", "붕괴", "전복", "압착"),
    "04": ("부딪힘", "충돌", "접촉", "차량", "지게차", "이동", "통행"),
    "05": ("맞음", "낙하", "비래", "물체", "공구", "자재", "파편"),
    "06": ("무너짐", "붕괴", "토사", "굴착", "거푸집", "동바리", "구조물"),
    "07": ("끼임", "말림", "협착", "롤러", "기어", "컨베이어", "방호장치", "기계"),
    "08": ("절단", "베임", "찔림", "절삭", "칼날", "날카로운", "공구"),
    "09": ("감전", "전기", "전원", "누전", "차단", "활선", "접지"),
    "10": ("폭발", "파열", "압력", "용기", "가스", "보일러", "탱크"),
    "11": ("화재", "소화", "연기", "대피", "인화", "점화", "폭발", "파열", "누출"),
    "12": ("불균형", "무리한", "중량물", "근골격", "들기", "자세", "허리"),
    "13": ("이상온도", "고온", "저온", "화상", "동상", "열사병", "냉동"),
    "14": ("화학", "유해", "중독", "질식", "가스", "물질", "누출", "노출"),
    "15": ("산소결핍", "질식", "밀폐공간", "가스", "환기", "농도", "구출"),
    "16": ("빠짐", "익사", "수조", "물", "침수", "맨홀"),
}


class RagSearchAgent:
    name = "rag_searcher"

    def __init__(
        self,
        embedding_service: EmbeddingService | None = None,
        session: Session | None = None,
        top_k: int = 5,
        fallback_threshold: int = 3,
        fetch_multiplier: int = 5,
        minimum_relevance_score: float = 0.12,
    ) -> None:
        self.embedding_service = embedding_service or EmbeddingService()
        self.session = session
        self._owns_session = session is None
        self.top_k = top_k
        self.fallback_threshold = fallback_threshold
        self.fetch_multiplier = fetch_multiplier
        self.minimum_relevance_score = minimum_relevance_score

    async def run(self, state: SafetyChatState) -> SafetyChatState:
        query = state.normalized_message or state.message
        query_embedding = self.embedding_service.embed_text(query)
        session = self.session or SessionLocal()

        try:
            repository = DocumentSearchRepository(session)
            chunks = self.search(repository, state, query_embedding, query)
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
        query_text: str,
    ) -> list[RetrievedChunk]:
        if state.risk_classification is None:
            results = repository.search_global(query_embedding, self._fetch_limit())
            return self._rerank_results(query_text, state, results)

        candidates: list[RetrievedChunk] = []
        seen_chunk_ids: set[int] = set()
        risk_code = state.risk_classification.risk_code
        parent_risk_code = state.risk_classification.parent_risk_code

        if risk_code != "Z":
            detail_results = (
                repository.search_by_risk_code(
                    query_embedding=query_embedding,
                    risk_code=risk_code,
                    top_k=self._fetch_limit(),
                )
            )
            candidates.extend(detail_results)
            seen_chunk_ids.update(chunk.id for chunk in detail_results)

        reranked = self._rerank_results(query_text, state, candidates)

        if len(reranked) < self.fallback_threshold and parent_risk_code != "Z":
            parent_results = repository.search_by_parent_risk_code(
                query_embedding=query_embedding,
                parent_risk_code=parent_risk_code,
                top_k=self._fetch_limit(),
                exclude_chunk_ids=seen_chunk_ids,
            )
            candidates.extend(parent_results)
            seen_chunk_ids.update(chunk.id for chunk in parent_results)
            reranked = self._rerank_results(query_text, state, candidates)

        if len(reranked) < self.fallback_threshold:
            global_results = repository.search_global(
                query_embedding=query_embedding,
                top_k=self._fetch_limit(),
                exclude_chunk_ids=seen_chunk_ids,
            )
            candidates.extend(global_results)
            reranked = self._rerank_results(query_text, state, candidates)

        return reranked[: self.top_k]

    def _fetch_limit(self) -> int:
        return max(self.top_k, self.top_k * self.fetch_multiplier)

    def _rerank_results(
        self,
        query_text: str,
        state: SafetyChatState,
        chunks: list[RetrievedChunk],
    ) -> list[RetrievedChunk]:
        scored_chunks: list[RetrievedChunk] = []
        for chunk in chunks:
            relevance_score = self._relevance_score(query_text, state, chunk)
            if relevance_score < self.minimum_relevance_score:
                continue
            scored_chunks.append(
                chunk.model_copy(update={"score": round(relevance_score, 6)})
            )

        return sorted(scored_chunks, key=lambda chunk: chunk.score, reverse=True)

    def _relevance_score(
        self,
        query_text: str,
        state: SafetyChatState,
        chunk: RetrievedChunk,
    ) -> float:
        normalized_content = self._normalize(chunk.content)
        query_terms = self._extract_query_terms(query_text)
        risk_terms = self._risk_terms(state)

        query_matches = sum(
            1 for term in query_terms if self._normalize(term) in normalized_content
        )
        risk_matches = sum(
            1 for term in risk_terms if self._normalize(term) in normalized_content
        )

        if state.risk_classification is not None and query_matches + risk_matches == 0:
            return 0.0

        keyword_boost = min(0.4, query_matches * 0.04 + risk_matches * 0.08)
        code_boost = self._code_match_boost(state, chunk)
        return chunk.score + keyword_boost + code_boost

    def _risk_terms(self, state: SafetyChatState) -> tuple[str, ...]:
        if state.risk_classification is None:
            return ()

        classification = state.risk_classification
        terms = [
            classification.risk_type,
            classification.parent_risk_type,
            *RISK_RETRIEVAL_KEYWORDS.get(classification.parent_risk_code, ()),
        ]
        return tuple(dict.fromkeys(term for term in terms if term))

    def _code_match_boost(
        self,
        state: SafetyChatState,
        chunk: RetrievedChunk,
    ) -> float:
        if state.risk_classification is None:
            return 0.0

        classification = state.risk_classification
        boost = 0.0
        if classification.risk_code in chunk.risk_codes:
            boost += 0.02
        if classification.parent_risk_code in chunk.parent_risk_codes:
            boost += 0.01
        return boost

    def _extract_query_terms(self, query_text: str) -> tuple[str, ...]:
        terms = [
            term
            for term in re.split(r"[^0-9A-Za-z가-힣]+", query_text)
            if len(term) >= 2 and term not in QUERY_STOPWORDS
        ]
        return tuple(dict.fromkeys(terms))

    def _normalize(self, value: str) -> str:
        return re.sub(r"\s+", "", value).lower()
