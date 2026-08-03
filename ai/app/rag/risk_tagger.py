from app.agents.risk_classifier import RiskClassificationAgent
from app.schemas.rag import RagChunk


class RiskTagger:
    def __init__(
        self,
        risk_classifier: RiskClassificationAgent | None = None,
        use_llm: bool = True,
    ) -> None:
        self.risk_classifier = risk_classifier or RiskClassificationAgent()
        self.use_llm = use_llm

    def tag_chunk(self, chunk: RagChunk) -> RagChunk:
        classification = self.risk_classifier.classify(chunk.content, use_llm=self.use_llm)

        return chunk.model_copy(
            update={
                "risk_codes": [classification.risk_code],
                "parent_risk_codes": [classification.parent_risk_code],
                "risk_types": [classification.risk_type],
                "parent_risk_types": [classification.parent_risk_type],
                "metadata": {
                    **chunk.metadata,
                    "risk_confidence": classification.confidence,
                    "risk_tagging_method": classification.method,
                    "risk_tagging_reason": classification.reason,
                },
            }
        )

    def tag_chunks(self, chunks: list[RagChunk]) -> list[RagChunk]:
        return [self.tag_chunk(chunk) for chunk in chunks]
