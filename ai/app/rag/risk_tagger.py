from app.agents.risk_classifier import RiskClassificationAgent
from app.schemas.rag import RagChunk


class RiskTagger:
    def __init__(self, risk_classifier: RiskClassificationAgent | None = None) -> None:
        self.risk_classifier = risk_classifier or RiskClassificationAgent()

    def tag_chunk(self, chunk: RagChunk) -> RagChunk:
        classification = self.risk_classifier.classify(chunk.content)

        if classification.risk_code == "Z" or classification.confidence <= 0:
            return chunk.model_copy(
                update={
                    "risk_codes": ["Z"],
                    "risk_types": [classification.risk_type],
                    "metadata": {
                        **chunk.metadata,
                        "risk_confidence": classification.confidence,
                    },
                }
            )

        return chunk.model_copy(
            update={
                "risk_codes": [classification.risk_code],
                "risk_types": [classification.risk_type],
                "metadata": {
                    **chunk.metadata,
                    "risk_confidence": classification.confidence,
                },
            }
        )

    def tag_chunks(self, chunks: list[RagChunk]) -> list[RagChunk]:
        return [self.tag_chunk(chunk) for chunk in chunks]
