import hashlib
import math


class EmbeddingService:
    embedding_dimension = 1024

    def embed_text(self, text: str) -> list[float]:
        return self._deterministic_embedding(text)

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        return [self.embed_text(text) for text in texts]

    def _deterministic_embedding(self, text: str) -> list[float]:
        vector = [0.0] * self.embedding_dimension
        tokens = text.split()

        if not tokens:
            return vector

        for token in tokens:
            digest = hashlib.sha256(token.encode("utf-8")).digest()
            index = int.from_bytes(digest[:4], "big") % self.embedding_dimension
            sign = 1.0 if digest[4] % 2 == 0 else -1.0
            vector[index] += sign

        norm = math.sqrt(sum(value * value for value in vector))
        if norm == 0:
            return vector

        return [round(value / norm, 8) for value in vector]
