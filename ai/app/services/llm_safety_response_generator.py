import json
from typing import Any

import httpx
from pydantic import ValidationError

from app.config.settings import settings
from app.schemas.chat import RetrievedChunk, SafetyChatState
from app.schemas.safety_response import SafetyResponseResult


class LlmSafetyResponseGenerator:
    def __init__(
        self,
        api_key: str | None = None,
        model: str | None = None,
        base_url: str | None = None,
        timeout_seconds: float | None = None,
    ) -> None:
        self.api_key = api_key if api_key is not None else settings.open_api_key
        self.model = model or settings.openai_safety_model
        self.base_url = (base_url or settings.openai_api_base_url).rstrip("/")
        self.timeout_seconds = timeout_seconds or settings.openai_timeout_seconds

    def generate(self, state: SafetyChatState) -> SafetyResponseResult | None:
        if not self.api_key or not state.retrieved_chunks:
            return None

        try:
            response = self._request(state)
            return SafetyResponseResult.model_validate_json(response)
        except (httpx.HTTPError, json.JSONDecodeError, ValidationError, ValueError):
            return None

    def _request(self, state: SafetyChatState) -> str:
        payload = {
            "model": self.model,
            "input": [
                {
                    "role": "system",
                    "content": (
                        "You are an industrial safety assistant for foreign workers. "
                        "Answer in Korean for now. Use only the provided retrieved safety document chunks. "
                        "Do not guess or add procedures that are not supported by the chunks. "
                        "Prioritize immediate action: stop work, move away if possible, report to a supervisor "
                        "or safety manager, then provide additional safety steps. "
                        "If the chunks are insufficient, say the evidence is insufficient and advise stopping "
                        "work and contacting a supervisor."
                    ),
                },
                {
                    "role": "user",
                    "content": json.dumps(
                        {
                            "question": state.normalized_message or state.message,
                            "riskClassification": (
                                state.risk_classification.model_dump()
                                if state.risk_classification is not None
                                else None
                            ),
                            "retrievedChunks": self._format_chunks(state.retrieved_chunks),
                            "responseRules": [
                                "Keep each sentence short and clear.",
                                "Return 3 to 5 action steps.",
                                "The answer must be grounded only in retrievedChunks.",
                                "Do not mention unsupported technical details.",
                            ],
                        },
                        ensure_ascii=False,
                    ),
                },
            ],
            "text": {
                "format": {
                    "type": "json_schema",
                    "name": "safety_response",
                    "strict": True,
                    "schema": {
                        "type": "object",
                        "additionalProperties": False,
                        "properties": {
                            "safetySteps": {
                                "type": "array",
                                "minItems": 1,
                                "maxItems": 6,
                                "items": {"type": "string"},
                            },
                            "answer": {"type": "string"},
                        },
                        "required": ["safetySteps", "answer"],
                    },
                }
            },
            "max_output_tokens": 800,
        }
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        with httpx.Client(timeout=self.timeout_seconds) as client:
            response = client.post(
                f"{self.base_url}/responses",
                headers=headers,
                json=payload,
            )
            response.raise_for_status()

        return self._extract_output_text(response.json())

    def _format_chunks(self, chunks: list[RetrievedChunk]) -> list[dict[str, Any]]:
        return [
            {
                "chunkId": chunk.id,
                "documentName": chunk.source.document_name,
                "score": chunk.score,
                "riskCodes": chunk.risk_codes,
                "parentRiskCodes": chunk.parent_risk_codes,
                "content": chunk.content[:1500],
            }
            for chunk in chunks[:5]
        ]

    def _extract_output_text(self, data: dict[str, Any]) -> str:
        output_text = data.get("output_text")
        if isinstance(output_text, str) and output_text.strip():
            return output_text

        for item in data.get("output", []):
            for content in item.get("content", []):
                text = content.get("text")
                if isinstance(text, str) and text.strip():
                    return text

        raise ValueError("OpenAI response did not contain output text.")
