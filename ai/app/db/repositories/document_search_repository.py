from sqlalchemy import BigInteger, Text, bindparam, text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Session

from app.schemas.chat import RetrievedChunk, RetrievedSource


class DocumentSearchRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def search_by_risk_code(
        self,
        query_embedding: list[float],
        risk_code: str,
        top_k: int,
        exclude_chunk_ids: set[int] | None = None,
    ) -> list[RetrievedChunk]:
        statement = self._base_search_statement(
            "dc.risk_codes @> :risk_codes",
        ).bindparams(bindparam("risk_codes", type_=ARRAY(Text)))
        return self._execute_search(
            statement=statement,
            query_embedding=query_embedding,
            top_k=top_k,
            exclude_chunk_ids=exclude_chunk_ids,
            extra_params={"risk_codes": [risk_code]},
        )

    def search_by_parent_risk_code(
        self,
        query_embedding: list[float],
        parent_risk_code: str,
        top_k: int,
        exclude_chunk_ids: set[int] | None = None,
    ) -> list[RetrievedChunk]:
        statement = self._base_search_statement(
            "dc.parent_risk_codes @> :parent_risk_codes",
        ).bindparams(bindparam("parent_risk_codes", type_=ARRAY(Text)))
        return self._execute_search(
            statement=statement,
            query_embedding=query_embedding,
            top_k=top_k,
            exclude_chunk_ids=exclude_chunk_ids,
            extra_params={"parent_risk_codes": [parent_risk_code]},
        )

    def search_global(
        self,
        query_embedding: list[float],
        top_k: int,
        exclude_chunk_ids: set[int] | None = None,
    ) -> list[RetrievedChunk]:
        return self._execute_search(
            statement=self._base_search_statement(),
            query_embedding=query_embedding,
            top_k=top_k,
            exclude_chunk_ids=exclude_chunk_ids,
            extra_params={},
        )

    def _execute_search(
        self,
        statement,
        query_embedding: list[float],
        top_k: int,
        exclude_chunk_ids: set[int] | None,
        extra_params: dict[str, object],
    ) -> list[RetrievedChunk]:
        result = self.session.execute(
            statement,
            {
                "query_embedding": self._format_vector(query_embedding),
                "top_k": top_k,
                "exclude_chunk_ids": list(exclude_chunk_ids or set()),
                **extra_params,
            },
        )
        return [self._row_to_retrieved_chunk(row) for row in result]

    def _base_search_statement(self, filter_clause: str | None = None):
        where_clauses = ["NOT (dc.id = ANY(:exclude_chunk_ids))"]
        if filter_clause is not None:
            where_clauses.append(filter_clause)

        where_sql = " AND ".join(where_clauses)
        return text(
            f"""
            SELECT
                dc.id AS chunk_id,
                dc.content,
                dc.risk_codes,
                dc.parent_risk_codes,
                dc.risk_types,
                dc.parent_risk_types,
                ds.id AS source_id,
                ds.source_title AS document_name,
                dc.embedding <=> CAST(:query_embedding AS vector) AS distance
            FROM document_chunks dc
            JOIN document_sources ds ON ds.id = dc.source_id
            WHERE {where_sql}
            ORDER BY dc.embedding <=> CAST(:query_embedding AS vector)
            LIMIT :top_k
            """
        ).bindparams(bindparam("exclude_chunk_ids", type_=ARRAY(BigInteger)))

    def _row_to_retrieved_chunk(self, row) -> RetrievedChunk:
        distance = float(row.distance)
        return RetrievedChunk(
            id=int(row.chunk_id),
            content=row.content,
            score=round(max(0.0, 1.0 - distance), 6),
            source=RetrievedSource(
                sourceId=int(row.source_id),
                chunkId=int(row.chunk_id),
                documentName=row.document_name,
            ),
            risk_codes=list(row.risk_codes or []),
            parent_risk_codes=list(row.parent_risk_codes or []),
            risk_types=list(row.risk_types or []),
            parent_risk_types=list(row.parent_risk_types or []),
        )

    def _format_vector(self, embedding: list[float]) -> str:
        return "[" + ",".join(str(value) for value in embedding) + "]"
